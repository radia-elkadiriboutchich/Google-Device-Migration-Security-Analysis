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

> 💡 *Note : Le rapport technique complet en format PDF détaillant toute notre démarche est disponible à la racine de ce dépôt.*

---

## ⚡ Méthodologie, Environnement et Preuves de Concept (PoC)

### 1. Environnement de Test & Accès Root (ADB)
L'expérimentation a été menée sur un smartphone physique **Samsung Galaxy A01 Core (SM-A013G) sous Android 10**. Le téléphone a été rooté via Magisk et flashé par Odin3. L'accès super-utilisateur a été validé avec succès via le shell ADB.

<img width="696" height="152" alt="root" src="https://github.com/user-attachments/assets/7ee1a724-de6a-469b-b0a0-4e94c26f0b8b" />

### 2. Analyse Statique et Identification du Chiffrement (JADX)
L'exploration de la classe obfusquée `elk` a permis de mettre en évidence l'appel direct aux primitives cryptographiques de chiffrement symétrique et d'authentification.

<img width="1442" height="667" alt="image" src="https://github.com/user-attachments/assets/e65e6ff1-98be-4c17-ba99-b319d468666a" />
<img width="1701" height="361" alt="image" src="https://github.com/user-attachments/assets/9f36afad-da8c-4f7c-957a-20ebc2226026" />

### 3. Instrumentation Dynamique (Frida)
Pour valider le comportement en conditions réelles, le framework Frida a été déployé. Face au mécanisme d'initialisation paresseuse (*Lazy Loading*) de la classe `elk` en mémoire, un pivot stratégique a été opéré pour hooker de manière agnostique la JCA native (`javax.crypto.Cipher`), permettant d'intercepter avec succès l'attachement au processus.

<img width="1158" height="355" alt="frida" src="https://github.com/user-attachments/assets/c99170a6-54d2-4be9-8190-8210e33827ed" />

---

## 🛠️ Outils & Environnement Technique
- **Analyse Statique :** JADX-GUI, Apktool, parsing d'étiquettes binaires (`UUID`, `WRAP`, `WPKY`).
- **Analyse Dynamique :** Frida Core/Server v17.5.1, Android Debug Bridge (ADB) en mode super-utilisateur (`su`).
- **Système :** Magisk Manager, Flashage de partition AP via Odin3.

## 👥 Équipe de Recherche  (Filière Sécurité Informatique et Cybersécurité - ENSAO)
- Radia EL KADIRI BOUTCHICH
- Ghizlane El Aouni
- Aicha Daanoun
- Fadwa Abiza

*Projet académique encadré par le Pr. MOHAMMED AMINE KOULALI.*
