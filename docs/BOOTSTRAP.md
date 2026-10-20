# Bootstrap dans le site World Tech Consulting S.A

- Version : Bootstrap 5.3.3, hébergé **en local** (`assets/vendor/bootstrap/`), donc aucun CDN externe
  et aucun problème sur GitHub Pages ni hors ligne.
- Chargement : `bootstrap.min.css` avant `css/styles.css`, `bootstrap.bundle.min.js` avant `js/script.js`.
- Utilisé pour : la grille (`row` / `col-*` / `g-*`) dans le footer, la mission/vision et le formulaire
  de contact ; les champs `form-label` / `form-control` ; la validation `was-validated` ;
  les utilitaires (`h-100`, `w-100`).
- Identité visuelle conservée : `css/styles.css` (bloc « COMPATIBILITÉ BOOTSTRAP ») neutralise le reboot
  de Bootstrap, et les couleurs/typographies restent celles de World Tech.
- Pour utiliser d'autres composants Bootstrap (modales, accordéons, carrousel...), il suffit d'ajouter
  le HTML correspondant : le JavaScript est déjà chargé.

## Pages solutions (menu Services)
- `#securite` : sécurité électronique, complétée avec les sites sensibles (Rapiscan, Thruvision, Rohde & Schwarz, Intellicene), FAQ, démarche.
- `#aeroport` : solutions aéroportuaires (14 solutions par domaine).
- `#finance` : institutions financières (traceurs 3SI, encre anti-vol, Edge360 Surveill, FAQ).
- Les solutions et la FAQ utilisent l'accordéon Bootstrap (`accordion`), les tableaux utilisent `table`.

## Photos
- 49 photos dans `assets/photos/` (`aeroports/`, `finance/`, `securite/`), affichées dans la solution correspondante de chaque page.
- Clic sur une photo : agrandissement dans une fenêtre Bootstrap (modal `#photoModal`).
- Pour ajouter une photo : copier le fichier dans le bon dossier, puis ajouter un bloc `<figure class="wt-fig">` identique aux autres dans `index.html`.
