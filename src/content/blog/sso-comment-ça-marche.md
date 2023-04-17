---
title: SSO - Comment ça marche ?
date: 2021-02-22T00:00:00.000Z
author: Ali Sanhaji
description: Cette première partie explique les principes généraux du SSO, et son implémentation via SAML. La seconde partie abordera OAuth2/OpenID Connect, et la comparaison avec SAML.
---
Le Single Sign-On, ou authentification unique, est le service qui permet aux utilisateurs de s’authentifier une seule fois auprès d’un fournisseur d’identité, ce qui lui donne accès ensuite à toutes les applications et services associés à cette authentification. L’utilisateur n’a besoin que d’un seul ensemble d’identifiants (p.ex., nom d’utilisateur/mot de passe) pour accéder à toutes ses applications.

Le SSO permet d’éviter à l’utilisateur de devoir mémoriser et utiliser des identifiants différents pour chacune des applications auxquelles il accède.

Mais ce n’est pas la même chose que d’enregistrer les mêmes identifiants dans toutes les applications (max_la_terreur/motdepassedelafureur). Ce n’est pas l’application qui connaît le mot de passe, mais le fournisseur d’identité.

Ce n’est pas non plus d’avoir un gestionnaire de mots de passe qui rentre les identifiants à la place de l’utilisateur à la mémoire faillible.

Le SSO, c’est utiliser un seul ensemble d’identifiants que seul le fournisseur d’identité reconnaît, et en qui les applications (fournisseurs de service) ont confiance pour gérer l’authentification de l’utilisateur.

# I - Le SSO, comment ça marche globalement ?

Dans cette histoire, il y a trois parties :

 - L’utilisateur qui veut se connecter à une application via son browser
 - L’application qui est le fournisseur de service (abréviation SP pour *Service Provider*) qui veut authentifier l’utilisateur
 - Le fournisseur d’identité (abréviation IdP pour *Identity Provider*) qui va authentifier l’utilisateur

## 1 – Échanges SSO
Voilà ce qui se passe quand un utilisateur veut accéder au *Service Provider* :

1.  L’utilisateur demande à accéder à une application (Service Provider)
2.  Le SP ne le connaît pas, il le redirige vers l’IdP
3.  L’IdP demande l’authentification de l’utilisateur
4.  L’utilisateur rentre ses identifiants
5.  S’ils sont bons, l’IdP signe un badge d’identité avec les informations sur l’utilisateur et le lui renvoie
6.  L’utilisateur se représente devant le SP avec le badge
7.  Le SP vérifie le badge et autorise l’accès au service

Voici maintenant l’utilisateur authentifié pour accéder au Service Provider. Maintenant l’Identity Provider connaît l’utilisateur, et si ce dernier veut accéder à un autre Service Provider, il n’a pas besoin de rentrer ses identifiants à nouveau. C’est-à-dire que l’étape 4 n’est plus nécessaire tant que l’Identity Provider maintient la session de l’utilisateur ouverte.

Théoriquement, c’est ce qui passe pour faire du SSO. Mais pratiquement, techniquement, il y a quelques questions qu’on se pose :

 - Comment le SP connaît l’IdP ?
 - Comment l’IdP connaît le SP ?
 - Comment le SP connaît les champs remontés par l’IdP ?
 - Par où passe le badge d’identité signé ?
 - Quelles informations il contient ?
 - Comment le Service Provider vérifie le badge ?

 Eh bien, les réponses à ces questions dépendent de l’implémentation du SSO, c’est-à-dire des protocoles utilisés pour faire les échanges de messages. Nous allons parler de deux de ces protocoles : SAML et oAuth2/OpenIDConnect.

Dans cette première partie, nous allons nous concentrer sur SAML.