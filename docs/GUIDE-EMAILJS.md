# Mise en service du formulaire de contact (EmailJS)

Les messages du formulaire arrivent dans info@worldtech.ht et le client reçoit une réponse automatique.
Aucune mention d'un service tiers n'apparaît dans l'expéditeur : l'email part de la boîte que vous connectez.

## 1. Compte et service d'envoi
1. Créer un compte sur emailjs.com.
2. Email Services > Add New Service > choisir "Gmail", "Outlook" ou "Custom SMTP (autre)".
   Pour que l'expéditeur soit info@worldtech.ht, connecter la boîte info@worldtech.ht
   (avec les paramètres SMTP fournis par votre hébergeur d'email). Si la boîte est sur Gmail/Outlook, utiliser ce service.
3. Noter le Service ID.

## 2. Deux modèles (templates)
- Email Templates > Create New Template > "Notification" :
  - To Email : info@worldtech.ht
  - From Name : World Tech — Site web
  - Reply To : {{from_email}}
  - Subject : Nouveau message — {{subject}}
  - Contenu : ouvrir l'éditeur de code (</>) et coller docs/emailjs-templates/notification.html
- Create New Template > "Réponse automatique" (optionnel) :
  - To Email : {{from_email}}
  - From Name : World Tech Consulting S.A
  - Reply To : info@worldtech.ht
  - Subject : Nous avons bien reçu votre message
  - Contenu : coller docs/emailjs-templates/autoreply.html

## 3. Identifiants dans le site
Account > General : copier la Public Key.
Ouvrir js/script.js, bloc EMAILJS_CONFIG, et remplir :
- publicKey, serviceId, templateId (notification), autoReplyId (réponse automatique, ou laisser '').

## 4. Sécurité
Account > Security : ajouter les domaines autorisés (worldtech.ht, www.worldtech.ht et votre-pseudo.github.io)
pour que personne d'autre ne puisse utiliser votre clé.

## 5. Mise en ligne (GitHub Pages)
Le fichier CNAME contient déjà worldtech.ht (l'adresse que les visiteurs tapent dans Google, Chrome, Firefox, Edge…; le "www" sera redirigé automatiquement vers cette adresse). Envoyer tout le contenu du dossier worldtech-site
dans un dépôt public GitHub, activer Pages (Settings > Pages), puis chez le gestionnaire DNS de worldtech.ht :
CNAME  www -> worldtechconsulting.github.io, et les 4 enregistrements A du domaine nu vers
185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153. Cocher "Enforce HTTPS".
