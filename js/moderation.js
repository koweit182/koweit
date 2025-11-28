/* ==============================================
   KOWEÏT MARKETPLACE - MODERATION.JS
   Système de modération automatique
   ============================================== */

const ModerationManager = {
    // Mots interdits (à enrichir selon les besoins)
    BANNED_WORDS: [
        'arnaque', 'scam', 'fake', 'faux', 'contrefaçon',
        'drogue', 'arme', 'prostitution', 'vol', 'voleur',
        'fraude', 'escroquerie', 'piratage', 'hack',
        'bitcoin gratuit', 'argent facile', 'devenir riche',
        // Ajoutez plus selon vos besoins
    ],
    
    // Patterns suspects
    SUSPICIOUS_PATTERNS: [
        /\b(envoie[z]?\s+moi|envoye[z]?\s+moi)\b/i,
        /\b(western\s+union|money\s*gram)\b/i,
        /\b(bitcoin|crypto).{0,30}(gratuit|free|cadeau)\b/i,
        /\b(urgent|vite|rapide|immédiat).{0,50}(argent|cash|dollar|€|\$)\b/i,
        /\b(clique[z]?\s+(ici|here)|click\s+here).{0,30}(lien|link|url|http)\b/i,
        /\b(100%|garanti).{0,30}(gagner|profit|bénéfice)\b/i,
        /\b(mot\s+de\s+passe|password|compte\s+bancaire)\b/i,
    ],
    
    // Indicateurs négatifs
    NEGATIVE_INDICATORS: [
        'attention', 'méfiance', 'danger', 'risque',
        'problème', 'arnaque', 'vol', 'perte'
    ],
    
    // Modérer le contenu d'une annonce
    moderateContent(content) {
        const text = `${content.title} ${content.description}`.toLowerCase();
        const issues = [];
        let score = 0;
        
        // 1. Vérifier les mots interdits
        for (const word of this.BANNED_WORDS) {
            if (text.includes(word.toLowerCase())) {
                issues.push({
                    type: 'BANNED_WORD',
                    severity: 'HIGH',
                    message: `Mot interdit détecté : "${word}"`,
                    word: word
                });
                score += 10;
            }
        }
        
        // 2. Vérifier les patterns suspects
        for (const pattern of this.SUSPICIOUS_PATTERNS) {
            if (pattern.test(text)) {
                issues.push({
                    type: 'SUSPICIOUS_PATTERN',
                    severity: 'MEDIUM',
                    message: 'Contenu suspect détecté (demande d\'argent ou lien suspect)'
                });
                score += 5;
            }
        }
        
        // 3. Analyse de sentiment négatif
        let negativeCount = 0;
        for (const indicator of this.NEGATIVE_INDICATORS) {
            if (text.includes(indicator)) {
                negativeCount++;
            }
        }
        
        if (negativeCount >= 3) {
            issues.push({
                type: 'NEGATIVE_SENTIMENT',
                severity: 'LOW',
                message: 'Contenu à tonalité très négative'
            });
            score += 3;
        }
        
        // 4. Trop de majuscules (spam)
        const upperCaseRatio = text.replace(/[^A-ZÀ-Ü]/g, '').length / text.replace(/\s/g, '').length;
        if (upperCaseRatio > 0.5 && text.length > 20) {
            issues.push({
                type: 'SPAM',
                severity: 'MEDIUM',
                message: 'Trop de majuscules (spam potentiel)'
            });
            score += 4;
        }
        
        // 5. Caractères répétés anormalement
        if (/(.)\1{10,}/.test(text)) {
            issues.push({
                type: 'SPAM',
                severity: 'MEDIUM',
                message: 'Caractères répétés anormalement'
            });
            score += 4;
        }
        
        // 6. Trop de liens/URLs
        const urlCount = (text.match(/http[s]?:\/\//g) || []).length;
        if (urlCount > 2) {
            issues.push({
                type: 'SPAM',
                severity: 'MEDIUM',
                message: 'Trop de liens externes'
            });
            score += 4;
        }
        
        // 7. Trop d'émojis
        const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
        if (emojiCount > 10) {
            issues.push({
                type: 'SPAM',
                severity: 'LOW',
                message: 'Trop d\'émojis'
            });
            score += 2;
        }
        
        // 8. Numéros de téléphone multiples dans la description
        const phoneNumbers = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
        if (phoneNumbers.length > 2) {
            issues.push({
                type: 'SUSPICIOUS',
                severity: 'LOW',
                message: 'Plusieurs numéros de téléphone détectés'
            });
            score += 2;
        }
        
        // 9. Prix anormalement bas (possible arnaque)
        if (content.price && content.price > 0) {
            const priceStr = content.price.toString();
            if (/^0\.0*[1-9]$/.test(priceStr)) {
                issues.push({
                    type: 'SUSPICIOUS_PRICE',
                    severity: 'MEDIUM',
                    message: 'Prix anormalement bas'
                });
                score += 3;
            }
        }
        
        // Décision finale
        const approved = score < 10; // Seuil de tolérance
        
        return {
            approved: approved,
            score: score,
            issues: issues,
            severity: score >= 10 ? 'HIGH' : score >= 5 ? 'MEDIUM' : 'LOW',
            recommendation: approved ? 'APPROVE' : 'REJECT'
        };
    },
    
    // Modérer un utilisateur (historique)
    moderateUser(userId) {
        const logs = JSON.parse(localStorage.getItem('koweit_moderation_logs') || '[]');
        
        // Compter les rejets récents (7 derniers jours)
        const recentRejections = logs.filter(log => 
            log.userId === userId &&
            log.action === 'REJECTED' &&
            Date.now() - new Date(log.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
        ).length;
        
        // Compter les signalements
        const reports = StorageManager.getAllListings()
            .filter(listing => listing.userId === userId)
            .reduce((sum, listing) => sum + (listing.reportsCount || 0), 0);
        
        const shouldBan = recentRejections >= 5 || reports >= 10;
        
        return {
            shouldBan: shouldBan,
            reason: shouldBan 
                ? (recentRejections >= 5 
                    ? 'Trop de tentatives de publication de contenu interdit' 
                    : 'Trop de signalements reçus')
                : null,
            stats: {
                recentRejections,
                totalReports: reports
            }
        };
    },
    
    // Logger une action de modération
    logModerationAction(action, targetType, targetId, reason, userId = null) {
        const logs = JSON.parse(localStorage.getItem('koweit_moderation_logs') || '[]');
        
        logs.push({
            id: 'log_' + Date.now(),
            action: action, // REJECTED, APPROVED, BANNED, etc.
            targetType: targetType, // listing, user, comment
            targetId: targetId,
            reason: reason,
            userId: userId,
            createdAt: new Date().toISOString()
        });
        
        // Garder seulement les 1000 derniers logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('koweit_moderation_logs', JSON.stringify(logs));
    },
    
    // Bannir automatiquement un utilisateur
    banUser(userId, reason) {
        const users = JSON.parse(localStorage.getItem('koweit_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].isBanned = true;
            users[userIndex].banReason = reason;
            users[userIndex].bannedAt = new Date().toISOString();
            
            localStorage.setItem('koweit_users', JSON.stringify(users));
            
            // Logger l'action
            this.logModerationAction('BANNED', 'user', userId, reason);
            
            // Désactiver toutes les annonces de l'utilisateur
            const listings = StorageManager.getAllListings();
            listings.forEach(listing => {
                if (listing.userId === userId) {
                    listing.isActive = false;
                    listing.moderationReason = 'Utilisateur banni';
                }
            });
            
            localStorage.setItem('koweit_listings', JSON.stringify(listings));
            
            return { success: true, message: 'Utilisateur banni' };
        }
        
        return { success: false, error: 'Utilisateur non trouvé' };
    },
    
    // Obtenir les statistiques de modération
    getModerationStats() {
        const logs = JSON.parse(localStorage.getItem('koweit_moderation_logs') || '[]');
        const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        const recentLogs = logs.filter(log => 
            new Date(log.createdAt).getTime() > last7Days
        );
        
        return {
            total: logs.length,
            last7Days: recentLogs.length,
            rejected: recentLogs.filter(l => l.action === 'REJECTED').length,
            banned: recentLogs.filter(l => l.action === 'BANNED').length,
            approved: recentLogs.filter(l => l.action === 'APPROVED').length
        };
    }
};

// Export
window.ModerationManager = ModerationManager;
