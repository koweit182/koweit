// lib/email.js - Service d'envoi d'emails
const sgMail = require('@sendgrid/mail');

// Initialiser SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Envoyer un email OTP
 */
async function sendOTPEmail(to, code, userName) {
  try {
    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@koweit-marketplace.com',
      subject: '🔐 Votre code de connexion KOWEÏT Marketplace',
      text: `Bonjour ${userName},\n\nVotre code de connexion est : ${code}\n\nCe code expire dans 10 minutes.\n\nSi vous n'avez pas demandé ce code, ignorez cet email.\n\nCordialement,\nL'équipe KOWEÏT Marketplace`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #003C71; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; font-weight: bold; color: #003C71; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>KOWEÏT Marketplace</h1>
              <p>Votre code de connexion</p>
            </div>
            <div class="content">
              <p>Bonjour <strong>${userName}</strong>,</p>
              <p>Vous avez demandé un code de connexion pour accéder à KOWEÏT Marketplace.</p>
              <div class="code">${code}</div>
              <p><strong>⏱️ Ce code expire dans 10 minutes.</strong></p>
              <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
              <p>Cordialement,<br>L'équipe KOWEÏT Marketplace</p>
            </div>
            <div class="footer">
              <p>© 2024 KOWEÏT Marketplace. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoyer un email de récupération
 */
async function sendRecoveryEmail(to, code, userName) {
  try {
    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@koweit-marketplace.com',
      subject: '🔑 Récupération de compte - KOWEÏT Marketplace',
      text: `Bonjour ${userName},\n\nVous avez demandé à récupérer votre compte.\n\nVotre code de récupération est : ${code}\n\nCe code expire dans 1 heure.\n\nSi vous n'avez pas demandé cette récupération, ignorez cet email.\n\nCordialement,\nL'équipe KOWEÏT Marketplace`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #003C71; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; font-weight: bold; color: #003C71; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>KOWEÏT Marketplace</h1>
              <p>Récupération de compte</p>
            </div>
            <div class="content">
              <p>Bonjour <strong>${userName}</strong>,</p>
              <p>Vous avez demandé à récupérer votre compte KOWEÏT Marketplace.</p>
              <div class="code">${code}</div>
              <p><strong>⏱️ Ce code expire dans 1 heure.</strong></p>
              <p>Si vous n'avez pas demandé cette récupération, ignorez cet email et votre compte restera sécurisé.</p>
              <p>Cordialement,<br>L'équipe KOWEÏT Marketplace</p>
            </div>
            <div class="footer">
              <p>© 2024 KOWEÏT Marketplace. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoyer un email de bienvenue
 */
async function sendWelcomeEmail(to, userName) {
  try {
    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@koweit-marketplace.com',
      subject: '🎉 Bienvenue sur KOWEÏT Marketplace !',
      text: `Bonjour ${userName},\n\nBienvenue sur KOWEÏT Marketplace !\n\nVotre compte a été créé avec succès. Vous pouvez maintenant publier vos annonces et acheter des produits.\n\nCordialement,\nL'équipe KOWEÏT Marketplace`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #003C71; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue !</h1>
              <p>KOWEÏT Marketplace</p>
            </div>
            <div class="content">
              <p>Bonjour <strong>${userName}</strong>,</p>
              <p>Bienvenue sur <strong>KOWEÏT Marketplace</strong>, la marketplace #1 au Congo !</p>
              <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
              <ul>
                <li>📱 Publier vos annonces</li>
                <li>🛒 Acheter des produits</li>
                <li>💬 Contacter les vendeurs</li>
                <li>⭐ Gérer votre profil</li>
              </ul>
              <p>Merci de nous faire confiance !</p>
              <p>Cordialement,<br>L'équipe KOWEÏT Marketplace</p>
            </div>
            <div class="footer">
              <p>© 2024 KOWEÏT Marketplace. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOTPEmail,
  sendRecoveryEmail,
  sendWelcomeEmail
};
