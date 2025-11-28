/* ==============================================
   KOWEÏT MARKETPLACE - PUBLISH PAGE
   Scripts pour publier une annonce
   ============================================== */

let selectedPhotos = [];

document.addEventListener('DOMContentLoaded', () => {
    setupPhotoUpload();
    setupForm();
});

// Configuration du téléchargement de photos
function setupPhotoUpload() {
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    
    photoInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        
        // Limite de 5 photos
        if (selectedPhotos.length + files.length > 5) {
            alert('Maximum 5 photos autorisées');
            return;
        }
        
        // Traiter chaque fichier
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                alert('Seules les images sont acceptées');
                continue;
            }
            
            // Compresser l'image
            try {
                const compressedImage = await App.compressImage(file);
                selectedPhotos.push(compressedImage);
                
                // Ajouter à la prévisualisation
                addPhotoPreview(compressedImage);
            } catch (error) {
                console.error('Erreur lors de la compression:', error);
                alert('Erreur lors du traitement de l\'image');
            }
        }
        
        // Réinitialiser l'input
        photoInput.value = '';
    });
}

// Ajouter une photo à la prévisualisation
function addPhotoPreview(imageData) {
    const photoPreview = document.getElementById('photo-preview');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'photo-preview-item';
    
    const img = document.createElement('img');
    img.src = imageData;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'photo-preview-remove';
    removeBtn.innerHTML = '×';
    removeBtn.type = 'button';
    removeBtn.onclick = () => {
        const index = selectedPhotos.indexOf(imageData);
        if (index > -1) {
            selectedPhotos.splice(index, 1);
        }
        previewItem.remove();
    };
    
    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    photoPreview.appendChild(previewItem);
}

// Configuration du formulaire
function setupForm() {
    const form = document.getElementById('publish-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validation
        if (selectedPhotos.length === 0) {
            alert('Veuillez ajouter au moins une photo');
            return;
        }
        
        // Récupérer les données du formulaire
        const formData = {
            title: document.getElementById('title').value.trim(),
            category: document.getElementById('category').value,
            condition: document.getElementById('condition').value,
            description: document.getElementById('description').value.trim(),
            price: parseFloat(document.getElementById('price').value) || 0,
            commune: document.getElementById('commune').value,
            quartier: document.getElementById('quartier').value.trim(),
            whatsapp: document.getElementById('whatsapp').value.trim(),
            sellerName: document.getElementById('seller-name').value.trim(),
            photos: selectedPhotos
        };
        
        // Validation supplémentaire
        if (!App.validatePhoneNumber(formData.whatsapp)) {
            alert('Veuillez entrer un numéro WhatsApp valide (ex: +243 XXX XXX XXX)');
            return;
        }
        
        // Désactiver le bouton de soumission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Vérification en cours...';
        
        try {
            // MODÉRATION AUTOMATIQUE
            const moderationResult = ModerationManager.moderateContent(formData);
            
            if (!moderationResult.approved) {
                const issues = moderationResult.issues.map(i => '• ' + i.message).join('\n');
                alert('❌ Annonce rejetée par notre système de modération\n\n' + issues + '\n\nVeuillez corriger et réessayer.');
                
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            
            // Ajouter l'annonce
            const newListing = StorageManager.addListing(formData);
            
            if (newListing) {
                alert('✅ Votre annonce a été publiée avec succès !');
                
                // Rediriger vers la page de détail
                window.location.href = `detail.html?id=${newListing.id}`;
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Une erreur est survenue. Veuillez réessayer.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}
