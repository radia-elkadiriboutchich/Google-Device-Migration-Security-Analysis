# 🔄 Rétro-ingénierie des Services Google Play : Analyse de la Migration d'Appareils

Ce dépôt rassemble les travaux de recherche, scripts d'instrumentation et analyses menés dans le cadre de notre projet de Sécurité Mobile (SICS - 4ème année, ENSAO). L'objectif est de documenter et de valider les mécanismes de bas niveau (jumelage, négociation de clés et chiffrement en transit) de l'outil de restauration de données Google (`com.google.android.apps.restore`).

## 🔍 Axes de Recherche & Synthèse de l'Analyse Statique (JADX)
L'extraction et la décompilation des modules système (`base.apk` et `com.google.android.gms`) ont permis de cartographier précisément le fonctionnement interne du protocole :

1. **Technologies de Transfert (D2D) :** Identification des services sous-jacents confirmant un modèle hybride : phase de découverte en Bluetooth (BLE) et bascule automatique vers le Wi-Fi (Wi-Fi Direct) ou USB (`UsbD2dMigrateService`).
2. **Mécanismes de Jumelage :** 
   - *Android vers Android :* Orchestration via l'API Google *Nearby Connections* (sérialisation des options via la classe `gom` / `DiscoveryOptions`).
   - *iOS vers Android :* Architecture basée sur le protocole propriétaire d'Apple **Lockdown / usbmuxd**. Génération de certificats RSA-2048 (`ddj`), sérialisation des métadonnées du Hotspot Wi-Fi au format Apple **Plist (Property List)** et validation via un mécanisme de défi-réponse RSA.
3. **Chiffrement des Données :** Implémentation d'un chiffrement authentifié **AES-GCM (128 bits)** avec un vecteur d'initialisation (IV) aléatoire de 96 bits conforme aux standards NIST SP 800-38D (Classe `elk`). Support du mode **AES-CBC** pour assurer l'encapsulation initiale du protocole Lockdown.
4. **Gestion des Clés :** Accord de clés basé sur les courbes elliptiques standards (**ECDH** sur la courbe `secp256r1`) via la bibliothèque native *Conscrypt*. Dérivation du secret partagé via un schéma **HKDF (HMAC-SHA256)** avant l'utilisation du mécanisme d'encapsulation de clé **AESWrap (RFC 3394)** (Classe `ggq` et objets `dch`).

## ⚡ Analyse Dynamique & Instrumentation (Frida)
Pour valider l'analyse statique sur un environnement réel (**Samsung Galaxy A01 Core sous Android 10 rooté via Magisk/Odin**), un pipeline d'instrumentation dynamique avec Frida a été déployé. 

- **Découverte architecturale :** Une tentative de hook direct sur la classe `elk` a mis en évidence un mécanisme d'initialisation paresseuse (*Lazy Loading*) lié au cycle de vie de l'application (le code lourd de chiffrement n'étant pas mappé en mémoire avant la liaison réseau).
- **Pivot stratégique :** Développement d'un hook agnostique et transparent ciblant la porte d'entrée unique de la JCA : `javax.crypto.Cipher` (disponible dans le dossier `/scripts`).

## 🛠️ Outils & Environnement Technique
- **Analyse Statique :** JADX-GUI, Apktool, structures complexes de HashMaps et parsing d'étiquettes binaires (`UUID`, `WRAP`, `WPKY`).
- **Analyse Dynamique :** Frida Core/Server v17.5.1, Android Debug Bridge (ADB) en mode super-utilisateur (`su`).
- **Système :** Magisk Manager, Flashage de partition AP via Odin3.

## 👥 Équipe de Recherche  (Filière Sécurité Informatique et Cybersécurité - ENSAO)
- Radia EL KADIRI BOUTCHICH 
- Ghizlane El Aouni
- Aicha Daanoun
- Fadwa Abiza

*Sous la direction pédagogique du Pr. MOHAMMED AMINE KOULALI.*
