# Site Web de LOG

Ce dépôt contient le code source du site web d'entreprise de LOG. Le site est généré à l'aide d'[Astro](https://astro.build), un générateur de sites statiques qui nous permet de créer des sites modernes, rapides et optimisés. Nous utilisons [TailwindCSS](https://tailwindcss.com) pour nos besoins en style et [DecapCMS](https://decapcms.org/) comme système de gestion de contenu pour les articles de blog et les offres d'emploi.

## Table des matières

- [Choix techniques](#choix-techniques)
  - [Pourquoi Astro ?](#pourquoi-astro)
  - [Pourquoi TailwindCSS ?](#pourquoi-tailwindcss)
    - [Pourquoi ne pas utiliser des styles en ligne ?](#pourquoi-ne-pas-utiliser-des-styles-en-ligne)
    - [La maintenabilité dans tout ça ?](#la-maintenabilité-dans-tout-ça)
  - [Pourquoi DecapCMS ?](#pourquoi-decapcms)
- [Pour commencer](#pour-commencer)
- [Structure du projet](#structure-du-projet)
- [Déploiement](#déploiement)
  - [L'image Docker](#limage-docker)
  - [La politique de mise en cache](#la-politique-de-mise-en-cache)
  - [La configuration du Serverless Framwork](#la-configuration-du-framework-serverless)
  - [La chaîne de traitement](#la-chaîne-de-traitement)
- [Contributions](#contributions)


## Choix techniques

Ce site internet a été conçu dans une optique d'optimisation maximale. Cela a entraîné un certain nombre de choix techniques qui sont justifiés ici :

### Pourquoi Astro ?

Nous avions pour objectif de développer un site internet satisfaisant les critères du numérique responsable et permettant de gérer du contenu (offres d'emploi et articles de blog). Il s'est avéré que le meilleur compromis est d'utiliser un site statique, la mise à jour de ce dernier se faisant à l'aide d'une *astuce* qui sera détaillée plus bas. Mais développer un site statique, même de petite taille, directement « à la main » est une mauvaise pratique puisque cela engendre (énormément) de duplication de code et nuit par conséquent grandement à la maintenabilité. Pour palier à cela, on utilise des générateurs de site statique (SSG, pour *Static Site Generator*), qui sont des outils qui simplifient grandement le développement de ce genre de site.

Nos exigences étaient les suivantes :
 - Le code doit être simple
 - Génère uniquement du HTML : meilleures performances, meilleure SEO
 - Routage basé sur les fichiers : très pratique
 - Permet un développement basé sur des composants : indispensable pour la maintenabilité
 - Support de Markdown : pour les articles de blog / les offres d'emploi

Il y a plein de générateurs de site statique, mais il y en a très peu qui satisfont ces exigences. Par exemple les générateur qui permettent le développement basé sur des composants amènent énormément de Javascript pour l'hydratation. De la même manière, les autres générant uniquement du HTML viennent avec un langage spécifique (Nunjucks, Liquid, etc.) mais qui ne permettent pas l'approche orienté composants.

Astro est un générateur de site statique qui satisfait ces exigences, et qui intègre tout un ensemble de fontionnalités. Il a été pensé pour les sites orientés contenu (ce qui est notre cas) et pour l'optimisation (par défaut, 0% de javascript se retrouve dans le site une fois généré, les feuilles de style sont empaquetées de manière à les optimiser le plus possible, etc.)

Astro possède aussi une fonctionnalité très intéressante quand il s'agit de développer des sites selon les critères du numérique responsable : il permet d'intégrer des composants de framework javascript (React, Vue, Svelte, etc.) qui sont par défaut rendus en HTML uniquement, ou bien hydraté partiellement selon une architecture en îlots si le développeur le désire. Des directives d'hydratation permettent de ne charger le composants que lorsque cela est nécessaire, permettant de sauver grandement les performances. Bien que cette fonctionnalité n'ait pas été utilisée, elle pourrait se révéler importante dans l'avenir du projet.

Ce ne sont bien entendu pas les seuls fonctionnalités que propose Astro. Mais ce sont les critères qui ont essentiellement motivé nos choix durant le développement.

La documentation d'Astro, très bien faite, est [disponible ici](https://docs.astro.build/fr/). Elle détaille les concepts fondamentaux du générateur, ainsi que l'ensemble des possibilités que celui-ci offre.


### Pourquoi TailwindCSS

Notre deuxième préoccupation, après le numérique responsable, a été la maintenabilité. En effet, tout projet se doit d'être maintenable, c'est-à-dire que des personnes différentes des créatrices du projet puisse participer au projet sans dépenser énormément de temps dans sa prise en main. Cette réflexion au sujet de la maintenabilité nous poussé à utiliser l'approche dite de « l'utilité d'abord » (*utility-first* en anglais). Celle-ci consiste à construire des composants complexes à partir d'un ensemble contraint d'*utilités* primitives. TailwindCSS est un framework CSS qui permet de réaliser cela.

> **Note**<br/>
> Beaucoup de justifications parmi celles qui suivent sont issues de la documentation de TailwindCSS.

Traditionnellement, dès que l'on veut styliser un page web, on écrit du CSS.

> **Note**<br/>
> Les exemples ci-dessous suivent l'approche orienté composant d'Astro et la syntaxe associée. Pour plus d'information à ce sujet, vous pouvez [lire ceci](https://docs.astro.build/fr/core-concepts/astro-components/). Vous n'avez, pour le moment, juste à retenir que les feuilles de style d'un composant sont juxtaposées en-dessous de la description HTML.

```astro
---
import ChatNotificationLogoReference from '@static/img/logo.svg';
---

<div class="chat-notification">
  <div class="chat-notification-logo-wrapper">
    <img class="chat-notification-logo" src={ChatNotificationLogoReference} alt="Logo de la messagerie">
  </div>
  <div class="chat-notification-content">
    <h4 class="chat-notification-title">Messagerie</h4>
    <p class="chat-notification-message">Vous avez un nouveau message !</p>
  </div>
</div>

<style>
  .chat-notification {
    display: flex;
    max-width: 24rem;
    margin: 0 auto;
    padding: 1.5rem;
    border-radius: 0.5rem;
    background-color: #fff;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  .chat-notification-logo-wrapper {
    flex-shrink: 0;
  }
  .chat-notification-logo {
    height: 3rem;
    width: 3rem;
  }
  .chat-notification-content {
    margin-left: 1.5rem;
    padding-top: 0.25rem;
  }
  .chat-notification-title {
    color: #1a202c;
    font-size: 1.25rem;
    line-height: 1.25;
  }
  .chat-notification-message {
    color: #718096;
    font-size: 1rem;
    line-height: 1.5;
  }
</style>
```
Avec TailwindCSS, on stylise les éléments en appliquants des classes pré-existante directement dans l'HTML.

```astro
---
import ChatNotificationLogoReference from '@static/img/logo.svg';
---

<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
  <div class="shrink-0">
    <img class="h-12 w-12" src={ChatNotificationLogoReference} alt="Logo de la messagerie">
  </div>
  <div>
    <div class="text-xl font-medium text-black">Messagerie</div>
    <p class="text-slate-500">Vous avez un nouveau message !</p>
  </div>
</div>
```

Dans cet exemple, nous avons utilisé :
 - Les utilitaires pour les boîtes flexibles (**flexbox**) et les écarts de remplissage (**padding**) pour contrôler la mise en page de l'élément (`flex`, `shrink-0` et `p-6`)
 - Les utilitaires pour la largeur maximale (**max-width**) et les marges (**margin**) afin de contraindre la largeur de l'élement et pour le centrer horizontalement (`max-w-sm` et `mx-auto`)
 - Les utilitaires pour la couleur de l'arrière plan (**background color**), le rayon de courbure des bords (**border radius**) et l'ombre (**box-shadow**) pour styliser l'élément (`bg-white`, `rounded-xl` et `shadow-lg`)
 - Les utilitaires pour la largeur (**width**) et la hauteur (**height**) de façon à dimensionner le logo (`w-12 et h-12`)
 - L'utilitaire pour l'espace inter-élément (**space-between**) pour gérer l'espacement entre le logo et le texte (`space-x-4`)
 - Les utilitaires de corps, de couleur et de graisse de la fonte de caractère (**font size**, **text color** et **font-weight**) pour styliser le texte de l'élément (`text-xl`, `text-black`, `font-medium`, etc.)

Cette approche nous permet de concevoir un style complètement personnalisé pour le composant sans écrire une seule ligne de CSS.

Cela est souvent étrange au premier abord puisque l'aspect de la description HTML paraît d'avantage chaotique. Mais concevoir ainsi le style des composants est un réalité **une bonne pratique**. C'est une approche qu'il faut essayer pour se convaincre de sa pertinence.

En l'utilisant on s'aperçoit rapidement de quelques bénéfices vraiment importants :
 - **Plus de gaspillage d'énergie à inventer des noms de classe**. Plus de noms ridicules comme `sidebar-inner-wrapper` uniquement pour pouvoir styliser quelque chose et plus de besoin de réfléchir au nom abstrait parfait pour décrire ce qui n'est q'un simple conteneur flexible.
 - **Plus de croissance des CSS**. En utilisant l'approche traditionnelle, les fichiers CSS s'agrandissent à chaque fois qu'une nouvelle règle est ajoutée. Avec les utilitaires, tout est réutilisable et donc il est rarement nécessaire d'écrire à nouveau du CSS. Cela contribue à réduire drastiquement la taille des fichiers du site une fois généré et donc participe à satisfaire les critères du numérique responsable.
 - **Réaliser des changements est moins risqué**. Les règles CSS sont globales et il est parfois difficile de savoir si quelque chose va être cassé lorsqu'une modification est réalisée. Les classes au sein de l'HTML sont locales ce qui permet de faire des modifications sans se soucier de quelque chose qui pourrait casser.

On peut se demander pourquoi ne pas se contenter de règles de style en ligne. C'est d'une certaine manière ce que fait cette approche, mais utiliser les classes utilitaires a en réalité des avantages importants :
 - **Conception sous contrainte**. En utilisant des règles de style en ligne, chaque valeur numérique est « magique ». Les utilitaires permettent de choisir des règles de style provenant d'un système de conception prédéfini ce qui rend beaucoup plus simple la création d'interfaces utilisateurs cohérants.
 - **La conception adaptative**. Il est impossible d'utiliser les requêtes media avec les règles de style en ligne contrairement aux utilitaires fournis par Tailwind.
 - ***Hover*, *focus* et autres états**. Les règles de style en ligne ne peuvent cibler des états spécifiques, mais les variants d'état de Tailwind le peuvent.

 Par exemple, ce composant construit entièrement à l'aide de classes utilitaires s'adapte complètement aux dimensions de l'écran de l'utilisateur et inclu un bouton s'adaptant aux états *hover* et *focus* :

 ```astro
 ---
 import PhotoReference from '@static/img/photo.jpg';
 ---

<div class="py-8 px-8 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
  <img class="block mx-auto h-24 rounded-full sm:mx-0 sm:shrink-0" src={PhotoReference} alt="Photo de profil" />
  <div class="text-center space-y-2 sm:text-left">
    <div class="space-y-0.5">
      <p class="text-lg text-black font-semibold">
        Jean Dupond
      </p>
      <p class="text-slate-500 font-medium">
        Ingénieur DevOps
      </p>
    </div>
    <button class="px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">Message</button>
  </div>
</div>
 ```

#### Pourquoi ne pas utiliser des styles en ligne ?

Une réaction courante à cette approche est de se demander si ce n'est pas simplement des styles en ligne, et d'une certaine manière c'est le cas - vous appliquez des styles directement aux éléments au lieu de leur assigner un nom de classe et de styliser ensuite cette classe.

Mais l'utilisation de classes utilitaires présente quelques avantages importants par rapport aux styles en ligne :

- Conception avec contraintes. Avec les styles en ligne, chaque valeur est un nombre magique. Avec les utilitaires, vous choisissez des styles à partir d'un système de conception prédéfini, ce qui facilite grandement la création d'interfaces utilisateur visuellement cohérentes.
- Conception réactive. Vous ne pouvez pas utiliser les requêtes média dans les styles en ligne, mais vous pouvez utiliser les utilitaires réactifs de Tailwind pour construire facilement des interfaces entièrement réactives.
- Survols, focus et autres états. Les styles en ligne ne peuvent pas cibler des états comme le survol ou le focus, mais les variantes d'état de Tailwind permettent de styliser facilement ces états avec des classes utilitaires.

#### La maintenabilité dans tout ça ?

Comment gérer des combinaisons d'utilitaires régulièrement utilisées ? C'est là que l'approche orienté composant entre en jeu :
```astro
---
// MonBouton.astro
---

<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">>
  <slot />
</button>
```

Ce bouton pourra être utilisé partout dans le code de la manière suivante :
```astro
---
import MonBouton from '@components/MonBouton.astro';
---

<MonBouton>
  Cliquez ici !
</MonBouton>
```

De façon plus générale, maintenir un projet utilisant une approche orienté classes utilitaires se révèle beaucoup plus simple que de maintenir une large base de code CSS, simplement parce que HTML est beaucoup plus simple à maintenir que CSS. De nombreuses entreprises utilisent déjà cette approche (GitHub, Netflix, Heroku, Twitch, etc.) avec succès.

La documentation de TailwindCSS, référençant notamment l'ensemble des classes utilitaires disponibles, est [disponible ici](https://tailwindcss.com/docs/installation).

### Pourquoi DecapCMS ?

Pour réaliser des sites web avec un contenu évolutif (blog, offres d'emploi, etc.) on retrouvera très majoritairement cette architecture :
```
     +---------------+
     |               |
     |  Navigateur   |
     |               |
     +-------+-------+
             ^
             |
             |
     +-------+-------+               +-----------------+
     |               |               |                 |
     |    Serveur    |               |       CMS       |
     |      Web      | <-----------+ |                 |<----------+ Éxecution de code côté serveur
     |               |               |                 |
     +-------+-------+               +-----------------+
             ^                                ^
             |                                |
     +-------+-------+               +-----------------+
     |               |               |                 |
     | Site statique |               |     Base de     |
     | (fichiers )   |               |     données     |<----------+ Éxecution en continue
     | (html, css)   |               |                 |
     | (et js    )   |               +-----------------+
     |               |
     +---------------+
```
Cette architecture implique que quelque chose s'exécute côté serveur et cela a un coût en énergie ainsi qu'en performance. Dans notre cas, cette architecure n'est pas souhaitable car il est possible d'actualiser un site statique à l'aide d'une approche DevOps : on peut déclencher un déploiement lorsque du code est poussé sur une branche spécifique d'un dépôt git (hébergé sur Gitlab / GitHub).
L'idée est la suivante : lorsque l'on souhaite modifier le site, on se rend sur une page spécifique qui propose un interface d'édition (s'exécutant côté client, ça n'est que du javascript). Lorsque la modification est publiée, elles sont poussées sur un dépôt git et cette action déclenche le re-déploiement du site. Les temps de déploiement étant courts (< 10 minutes, en pratique dans les 3 minutes) cela permet d'apliquer les modifications en quasi-temps réel.
L'architecture est comme suit :
```
     +---------------+
     |               |   Accède à l'interface d'édition sur /edit
     |  Navigateur   |+-----------------------+
     |               |                        |
     +-------+-------+                        | Pousse les modifications sur un dépôt git (hébergé sur Gitlab / Github)
             ^                                |
             |                                |
             |                                V
     +-------+-------+               +-----------------+
     |               |               |                 |
     |    Serveur    |               |    Dépôt git    |
     |      Web      |               |    (Gitlab)     |
     |               |               |                 |
     +-------+-------+               +-----------------+
             ^                                |
             |                                |
     +-------+-------+                        |
     |               |                        | Re-déploiement via une chaîne CI/CD
     | Site statique |                        |
     | (fichiers )   |                        |
     | (html, css)   |<-----------------------+
     | (et js    )   |
     |               |
     +---------------+
```

Pour procéder ainsi, il faut disposer d'une application web (écrite en Javascript / WASM, elle ne doit s'exécuter uniquement côté client) qui permet de réaliser des modification et de les pousser sur un dépôt. Pour cela, il existe DecapCMS (nouveau de NetlifyCMS), qui est le système de gestion de contenu basé sur Git le plus populaire (écrit en React).

La documentation est [disponible ici](https://decapcms.org/docs/intro/).

## Pour commencer

Pour démarrer l'environnement de développement, il faut avoir installé [Node.js](https://nodejs.org) et [Yarn](https://yarnpkg.com/) sur votre machine. Si ce n'est pas déjà fait, vous pouvez procéder ainsi :

1. Pour vérifier si `Node.js` est installé :
```bash
user@machine:~$ node -v
v18.16.0 # Attention : la version de node doit être >=16.12.0 pour que Astro puisse fonctionner
```
2. Si `Node.js` n'est pas installé :
```bash
user@machine:~$ sudo apt install nodejs npm # Systèmes basés sur dpkg (Debian, Ubuntu, etc.)
user@machine:~$ sudo dnf install nodejs npm # Systèmes basés sur rpm (Fedora, RHEL, etc.)
```
3. Installez `Yarn` :
```bash
user@machine:~$ npm install -g yarn # Remarquez le $ : il n'est pas recommandé d'exécuter cette commande en root
```

Sur les systèmes basés sur `dpkg` (Debian, Ubuntu, etc.) il est probable que la version de node soit très ancienne. Si les exigences d'Astro ne sont pas satisfaites (i.e. version strictement inférieure à 16.12.0), il est possible d'installer une version de `Node.js` plus récente en utilisant un dépôt de paquets alternatif (**PPA** pour *Personal Package Archive*) :
```bash
user@machine:~$ curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
user@machine:~$ sudo apt install nodejs
```


Pour initialiser l'environnement de développement, il suffit de faire :
1. Clonez ce dépôt : `git clone git@gitlab.com:log-consulting/log-website.git` (assurez-vous d'avoir ajouté un clé SSH à votre compte Gitlab)
2. Accédez au répertoire du projet : `cd log-website`
3. Installez les dépendances : `yarn`
4. Pour démarrer un serveur de développement local :  `yarn dev`

Ouvrez votre navigateur et rendez-vous sur [http://localhost:3000](http://localhost:3000) pour afficher le site web.

## Structure du projet

La structure du projet est organisée de la manière suivante :

- `astro.config.mjs` : Fichier de configuration Astro.
- `Dockerfile` : Description du conteneur qui sera déployé.
- `expires.inc` : Politique de cache du serveur web (utilisée dans le Dockerfile).
- `.github/workflows/github-actions.yml` : Actions Github pour déployer le site.
- `.gitignore` : Énumération des fichiers que git doit ignorer.
- `.gitlab-ci.yml` : Chaîne de traitement Gitlab pour déployer le site.
- `package.json` : Dépendances nécessaires à la construction du site et scripts.
- `public/` : Tout ce qui n'est pas du code et/ou des fichiers qui n'ont pas à être traités (icônes, fichiers téléversés, etc.).
- `README.md` : Ce fichier.
- `serverless.yml` : Configuration du framework [Serverless](https://www.serverless.com/) pour déployer un conteneur serverless chez Scaleway.
- `src/` : Ce répertoire contient le code source du site web.
  - `components/` : Composants d'interface utilisateur réutilisables utilisés dans tout le site (accessible via l'alias `@components`).
  - `content/` : Collections de contenu pour les articles de blog et les offres d'emploi. Les fichiers Markdown créés par DecapCMS y sont positionnés.
    - `blog/` : Dossier contenant l-es articles de blog au format Markdown.
    - `config.ts` : Définition des collections de contenu (offres d'emploi / articles de blog).
    - `job/` : Dossier contenant les offres d'emploi au format Markdown.
  - `layouts/` : Composants de mise en page utilisés pour structurer les différentes pages (accessible via l'alias `@layouts`).
  - `libs/types.ts` : Énumération de couleurs pour faciliter l'usage des composants (dossier parent accessible via l'alias `@libs`).
  - `pages/` : Composants de page individuels (dossier obligatoire duquel sont générées les routes) (accessible via l'alias `@pages`).
  - `static/` : Ressources statiques telles que des images (accessible via l'alias `@static`).
- `tailwind.config.cjs` : Configuration de TailwindCSS pour personnaliser les classes utilitaires (notamment la palette de couleur).
- `tsconfig.json` : Configuration de Typescript, contenant les alias d'importation.
- `yarn.lock` : Verrou de Yarn, géré automatiquement par l'outil.

## Déploiement

Pour déployer un site statique à moindre coûts, deux solutions sont possibles. On peut utiliser un bucket S3 et l'exposer à Internet ou bien le déployer plus classiquement en se souciant du serveur web. La problématique du bucket S3 est de ne pas (pour le moment) permettre d'utiliser de certificat TLS personalisé pour certifier le nom de domaine et utiliser HTTPS. De fait, cette solution n'est pas souhaitable. Mais il existe une autre solution, tout aussi (voire plus) flexible, qui consiste à déployer une image docker dans un conteneur dit *serverless*. C'est cette option qui a été choisie.

### L'image docker

Définie dans le fichier `Dockerfile`, l'image docker configure un serveur NGINX avec des paramètres spécifiques.

```Dockerfile
FROM nginx:alpine
```
On spécifie l'image de base à utiliser pour construire l'image comme étant une version légère de NGINX basé sur Alpine Linux (une distribution orienté conteneur qu'on utilise pour sa légèreté).

```Dockerfile
WORKDIR /usr/share/nginx/html/
```
Le répertoire de travail est définit à `/usr/share/nginx/html/` de façon à ce que toutes les commandes suivantes seroient exécutées à partir de ce répertoire.

```Dockerfile
RUN rm -rf * .??*
```
Tous les fichiers et dossiers présents dans le répertoire de travail sont supprimés pour nettoyer le dossier public par défaut afin de préparer l'espace pour le contenu du site web.

```Dockerfile
RUN sed -i '9i\        include /etc/nginx/conf.d/expires.inc;\n' /etc/nginx/conf.d/default.conf
```
Pour inclure la politique de cache dans la configuration de NGINX, la ligne `inlcude /etc/nginx/conf.d/expires.inc;` est insérée dans la configuratin par défaut.

```Dockerfile
COPY ./expires.inc /etc/nginx/conf.d/expires.inc
RUN chmod 0644 /etc/nginx/conf.d/expires.inc
```
Le fichier `expires.inc` du dépôt est copié vers l'emplacement souhaité dans le conteneur. Les permissions du fichier `expires.inc` sont mises à `0644`, ce qui signifie que le propriétaire peut lire et écrire, et les autres peuvent seulement lire.

```Dockerfile
COPY ./dist /usr/share/nginx/html
```
Le contenu du répertoire `dist` (accessible via un artefact) qui contient le site statique est copié dans `/usr/share/nginx/html` dans le conteneur.

```Dockerfile
ENV NGINX_HOST=log.consulting
```
La variable d'environnement `NGINX_HOST` est définie avec la valeur `log.consulting`. Elle permet de définir le nom du serveur virtuel dans la configuration de NGINX (fonctionnalité fournie par les concepteurs de l'image de base).

```Dockerfile
EXPOSE 80
```
Le port 80 du conteneur est exposé afin que NGINX soit accessible de l'extérieur.

De cette manière, on dispose de l'image d'un conteneur contenant un server web légé pouvant servir le site web.


### La politique de mise en cache

Comme mentionné précédemment, la politique de mise en cache est définie dans le fichier `expires.inc`.

Cette configuration comprend plusieurs directives qui définissent la manière dont NGINX traite les différentes ressources et gère la mise en cache.

```nginx
location = /favicon.ico {
    log_not_found off;
}
location = /robots.txt {
    log_not_found off;
}
```
L'enregistrement de la non-disponibilité des fichiers `favicon.ico` et `robots.txt` dans les logs est désactivé pour ne pas remplir inutilement la journalisation

```nginx
location ~* \.(?:css(\.map)?|js(\.map)?|jpe?g|png|gif|ico|cur|heic|webp|tiff?|mp3|m4a|aac|ogg|midi?|wav|mp4|mov|webm|mpe?g|avi|ogv|flv|wmv)$ {
    expires 7d;
}
```
Mise en cache des fichiers CSS, JS et des médias pendant 7 jours.

```nginx
location ~* \.(?:svgz?|ttf|ttc|otf|eot|woff2?)$ {
    add_header Access-Control-Allow-Origin "*";
    expires    7d;
}
```
Mise en cache des fontes de caractère et des SVG pendant 7 jours. On ajoute un en-tête HTTP pour permettre les requêtes depuis n'importe quel domaine.

```nginx
gzip            on;
gzip_vary       on;
gzip_proxied    any;
gzip_comp_level 6;
gzip_types      text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
```
 - La compression Gzip (`gzip on;`) est activé pour améliorer les performances en diminuant la taille des échanges de données entre le client et le serveur.
 - L'en-tête `Vary: Accept-Encoding` est ajouté aux réponses compressées pour indiquer que la réponse varie en fonction de l'encodage de compression (`gzip_vary on;`).
 - La compression Gzip est activée même pour les connexions mandatées (`gzip_proxied any;`)
 - Le niveau de compression Gzip est définit sur 6 (`gzip_comp_level 6;`)


### La configuration du framework Serverless

La configuration du framework Serverless spécifie différentes options pour le déploiement de l'image Docker dans un conteneur serverless Scaleway.

```yaml
service: logconsulting
configValidationMode: off
```
Cette directive désigne le nom du *namespace* à utiliser (en l'occurence `logconsulting`). Le configuration n'est pas validée car le fournisseur `scaleway` (cf. plus bas) est inconnu ; cela permet d'éviter un avertissement durant le déploiement.

```yaml
provider:
  name: scaleway
  scwToken: ${env:SCW_SECRET_KEY}
  scwProject: ${env:SCW_PROJECT_ID}
  scwRegion: ${env:SCW_REGION}
```

Cette partie de la configuration indique le fournisseur de cloud (en l'occurence Scaleway) et les informations d'authentification qui lui correspondent. Les informations d'authentification (la clé d'api `SCW_SECRET_KEY` et l'identifiant du projet `SCW_PROJECT_ID`) et la région Scaleway (`SCW_REGION`) sont récupérées à partir des variables d'environnement.

```yaml
plugins:
  - serverless-scaleway-functions
```
Le plugin `serverless-scaleway-functions` est utilisé pour étendre les fonctionnalités de déploiement spécifiques à Scaleway.

```yaml
custom:
  containers:
    logconsulting:
      description: Site internet de LOG
      directory: .
      maxScale: 1
      memoryLimit: 128
      minScale: 1
      port: 80
      custom_domains:
        - log.consulting
```
Cette section définit des options personnalisées pour les conteneurs serverless. Un conteneur avec le nom `logconsulting` est configuré avec les paramètres suivants :
- `description` indique la description du conteneur serverless
- `directory` indique le répertoire où se trouve l'image Docker et les fichiers nécessaires pour la construire
- "`minScale` et `maxScale` définissent le nombre minimum et maximum d'instances du conteneur serverless
- `memoryLimit` spécifie la limite de mémoire pour chaque instance du conteneur (Scaleway ne permet que de choisir des puissances de 2 de `128 MB` à `4096 MB`).
- `port` indique le port sur lequel le conteneur écoute les requêtes (le conteneur tel que défini par l'image Docker écoute sur le port 80).
- `custom_domains` indique le nom de domaine personnalisé associé au conteneur, ici `log.consulting`.

Il est à noter que la certification du nom de domaine est gérée automatiquement par Scaleway.

### La chaîne de traitement

Le déploiement du site est réalisé à l'aide d'une chaîne de traitement Gitlab définie dans le fichier `.gitlab-ci.yml`. Des actions Github, qui réalisent la même chose, sont aussi présentes dans ce dépôt mais ne seront pas explicitées puisqu'elles fonctionnent de la même manière.

La chaîne contient deux étapes (`build` et `deploy`) pour le processus de déploiement continu.

```yaml
stages:
 - build
 - deploy
```
La première étape `build` construit le site statique depuis le code source présent dans ce dépôt et la deuxième étape `deploy` le déploie chez Scaleway.

```yaml
build:
 stage: build
 image: node:latest
 script:
  - yarn
  - yarn astro build --experimental-integrations
 artifacts:
  paths:
   - dist
  expire_in: 15 minutes
 only:
  - main
```
Cette section configure l'étape de construction du site web. Elle utilise une image Docker basée sur l'image `node:latest` (pour pouvoir utiliser Yarn). La commande `yarn` installe les dépendances, puis la commande `yarn astro build --experimental-integrations` est utilisée pour construire l'application (en activant les potentielles intégrations expérimentales d'Astro qui aurait été configurées dans sa configuration). L'artefact généré (le dossier `dist` qui contient le site web généré) est défini pour être archivé et disponible pour les étapes ultérieures pendant 15 minutes. La directive `only` spécifie que cette étape ne sera exécutée que pour la branche `main`.

```yaml
deploy:
 stage: deploy
 image: docker:latest
 services:
  - docker:dind
 variables:
  SCW_SECRET_KEY: $SCW_SECRET_KEY
  SCW_PROJECT_ID: $SCW_PROJECT_ID
 before_script:
  - apk add --update npm
  - npm install serverless -g
  - npm install serverless-scaleway-functions
 script:
  - serverless deploy
 only:
  - main
```
Cette partie configure l'étape de déploiement du site. Elle utilise une image Docker basée sur l'image `docker:latest` ainsi que service `docker:dind` pour exécuter des conteneurs Docker dans Docker (ce qui est nécessaire ici pour utiliser le framework Serverless). Les variables d'environnement `SCW_SECRET_KEY` et `SCW_PROJECT_ID` sont définies pour pouvoir s'authentifier auprès de l'API de Scaleway et proviennent des secrets Gitlab. Les instructions suivantes installent npm ainsi que les paquets `serverless` (globalement, qui fournit l'utilitaire en ligne de commande homonyme) et `serverless-scaleway-functions` qui est le greffon qui permet d'intéragir avec l'API de Scaleway. Le site est ensuite déployé via la commande `serverless deploy`. Comme supra, la directive `only` spécifie que cette étape ne sera exécutée que pour la branche `main`.



## Contributions

De façon à ce que le site ne soit pas déployé à chaque commit poussé vers le dépôt distant et pour garder un historique relativement propre, il est recommandé de procéder ainsi pour modifier le site web :

2. Créez une nouvelle branche : `git checkout -b feature/nom-de-votre-fonctionnalité`
3. Effectuez des modifications et les valider : `git commit -am 'Ajouter une fonctionnalité'`
4. Pousser la branche : `git push origin feature/nom-de-votre-fonctionnalité`
5. Soumettre une demande de fusion (*merge request*).