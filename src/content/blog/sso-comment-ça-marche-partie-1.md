---
image: /uploads/developpeur-informatique.avif
title: SSO - Comment ça marche ? -Partie 1
category: Architecture
date: 2023-06-23T13:24:57.458Z
author: Ali Sanhaji
description: Cette première partie explique les principes généraux du SSO, et
  son implémentation via SAML. La seconde partie abordera OAuth2/OpenID Connect,
  et la comparaison avec SAML.
---
<!--StartFragment-->

Le Single Sign-On, ou authentification unique, est le service qui permet aux utilisateurs de s’authentifier une seule fois auprès d’un fournisseur d’identité, ce qui lui donne accès ensuite à toutes les applications et services associés à cette authentification. L’utilisateur n’a besoin que d’un seul ensemble d’identifiants (p.ex., nom d’utilisateur/mot de passe) pour accéder à toutes ses applications.

Le SSO permet d’éviter à l’utilisateur de devoir mémoriser et utiliser des identifiants différents pour chacune des applications auxquelles il accède.

Mais ce n’est pas la même chose que d’enregistrer les mêmes identifiants dans toutes les applications (max_la_terreur/motdepassedelafureur). Ce n’est pas l’application qui connaît le mot de passe, mais le fournisseur d’identité.

Ce n’est pas non plus d’avoir un gestionnaire de mots de passe qui rentre les identifiants à la place de l’utilisateur à la mémoire faillible.

Le SSO, c’est utiliser un seul ensemble d’identifiants que seul le fournisseur d’identité reconnaît, et en qui les applications (fournisseurs de service) ont confiance pour gérer l’authentification de l’utilisateur.

# I – Le SSO, comment ça marche globalement ?

Dans cette histoire, il y a trois partis :

* L’utilisateur qui veut se connecter à une application via son browser
* L’application qui est le fournisseur de service (abréviation SP pour Service Provider) qui veut authentifier l’utilisateur
* Le fournisseur d’identité (abréviation IdP pour Identity Provider) qui va authentifier l’utilisateur

## 1 – Échanges SSO

Voilà ce qui se passe quand un utilisateur veut accéder au Service Provider :

![](/uploads/imageali4.png)

1. L’utilisateur demande à accéder à une application (Service Provider)
2. Le SP ne le connaît pas, il le redirige vers l’IdP
3. L’IdP demande l’authentification de l’utilisateur
4. L’utilisateur rentre ses identifiants
5. S’ils sont bons, l’IdP signe un badge d’identité avec les informations sur l’utilisateur et le lui renvoie
6. L’utilisateur se représente devant le SP avec le badge
7. Le SP vérifie le badge et autorise l’accès au service

Voici maintenant l’utilisateur authentifié pour accéder au Service Provider. Maintenant l’Identity Provider connaît l’utilisateur, et si ce dernier veut accéder à un autre Service Provider, il n’a pas besoin de rentrer ses identifiants à nouveau. C’est-à-dire que l’étape 4 n’est plus nécessaire tant que l’Identity Provider maintient la session de l’utilisateur ouverte.

Théoriquement, c’est ce qui passe pour faire du SSO. Mais pratiquement, techniquement, il y a quelques questions qu’on se pose :

* Comment le SP connaît l’IdP ?
* Comment l’IdP connaît le SP ?
* Comment le SP connaît les champs remontés par l’IdP ?
* Par où passe le badge d’identité signé ?
* Quelles informations il contient ?
* Comment le Service Provider vérifie le badge ?

Eh bien, les réponses à ces questions dépendent de l’implémentation du SSO, c’est-à-dire des protocoles utilisés pour faire les échanges de messages. Nous allons parler de deux de ces protocoles : SAML et oAuth2/OpenIDConnect.

Dans cette première partie, nous allons nous concentrer sur SAML.

## 2 – SP, IdP, plateformes SSO

Mais d’abord, parlons un peu des différents Service Provider, Identity Provider et plateformes de SSO.

Des exemples de Service Provider sont :

* Salesforce
* SAP
* GCP
* Slack
* Confluence

Des exemples d’Identity Provider sont :

* Microsoft Active Directory Domain Services
* Microsoft Azure AD (Active Directory dans le cloud)
* Google
* Facebook
* LinkedIn
* Apple

Certaines de ces plateformes permettent de faire du SSO avec SAML ou OpenIDConnect, comme par exemple ADDS (Active Directory Domain Services, ou juste Active Directory comme on l’appelle plus souvent) permet de faire du SSO grâce à ADFS (Active Directory Federation Services).

Mais il y a aussi beaucoup de plateformes spécialisées dans le SSO qui jouent le rôle d’Identity Provider pour les entreprises qui les utilisent :

* Okta
* Auth0
* OneLogin

Ces plateformes permettent aux entreprises d’avoir une interface unique pour leurs Service Providers, et permettent quelques fonctions que les Identity Provider plus haut ne permettent pas.

Pour plus d’informations sur les plateformes de SSO, vous pouvez consulter les documentations d’Okta et de Auth0 qui sont très riches et très bien faites.

# II – SAML (Security Assertion Markup Language)

SAML est un protocole basé sur XML pour faire du SSO.

Voilà pour les présentations. Passons à la technique maintenant.

## 1 – SP-initiated flow

Pour SAML, nous reprenons le même schéma et les mêmes termes que lors de la présentation globale du SSO, mais nous allons voir comment se font les échanges techniquement et qu’est-ce qui est échangé précisément.

![](/uploads/imageali5.png)

1. L’utilisateur essaye d’accéder à une application (Service Provider)
2. Le SP Redirect (HTTP 302) vers l’IdP avec un AuthnRequest (Fichier XML) pour demander l’authentification de l’utilisateur
3. L’IdP présente la page d’authentification à l’utilisateur
4. L’utilisateur rentre ses identifiants
5. S’ils sont bons, l’IdP génère une assertion SAML (Fichier XML) avec les informations sur l’utilisateur et le lui renvoie en redirection (HTTP 302) vers le SP
6. L’utilisateur présente l’assertion SAML (avec un HTTP POST sur le SP) qui contient ses user attributes (informations sur l’utilisateur)
7. Le SP donne accès à l’application s’il a les bons user attributes

Maintenant, nous pouvons répondre aux questions que nous nous étions posés plus haut :

* Comment le SP connaît l’IdP ? L’IdP fournit préalablement au SP un fichier XML de metadata qui contient les informations nécessaires sur comment le contacter.
* Comment l’IdP connaît le SP ? En enregistrant l’application sur le service SSO de l’IdP, ou sur une plateforme SSO. Optionnel : le SP donne un fichier metadata à l’IdP.
* Comment le SP connaît les champs remontés par l’IdP ? Le fichier metadata de l’IdP contient les user attributes qui vont être remontés (Name ID, Groups, etc.).
* Par où passe l’assertion SAML ? Généralement une redirection via le navigateur pour faire un POST sur le Assertion Consumer Service URL renseigné lors de l’enregistrement du SP sur l’IdP.
* Quelles informations elle contient ? Name ID et attributes de l’utilisateur, la méthode d’authentification, la signature de l’IdP, la période de validité, pour l’essentiel.
* Comment le Service Provider vérifie l’assertion ? Dans les metadata de l’IdP se trouve la clé publique qui correspond à la clé privée utilisée par l’IdP pour signer l’assertion SAML.

## 2 – IdP-initiated flow

C’est le même processus que le SP-initiated flow, mais l’utilisateur s’authentifie lui-même d’abord sur l’IdP avant d’accéder à un SP associé. Les étapes 3 et 4 viennent avant les étapes 1 et 2.

## 3 – Pour finir

Le protocole SAML marche très bien pour faire de l’authentification SSO pour les applications qu’une entreprise offre à ses employés auprès de son fournisseur d’identité. Néanmoins il a quelques défauts lacunes qu’on pourra voir quand on parlera d’OpenID Connect et oAuth2 dans la seconde partie de cet article sur le SSO.

J’espère que le SAML est maintenant un peu plus clair et compréhensible. A bientôt pour la suite, qui sera un peu plus fournie (oAuth2, c’est énorme).

<!--EndFragment-->