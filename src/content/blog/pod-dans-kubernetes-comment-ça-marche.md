---
image: /uploads/cka.jpg
title: Préparation à la CKA - Lancement d’un Pod
category: DevOps
date: 2023-06-23T07:48:27.069Z
author: Ali Sanhaji
description: Cet article est le troisième d’une longue série qui aura pour but
  d’apprendre et de comprendre comment fonctionne Kubernetes, et qui permet de
  préparer la CKA.
---
<!--StartFragment-->

# Avant-propos

Bonjour à tous les curieux de kubernetes,

Cet article est le troisième d’une longue série qui aura pour but d’apprendre et de comprendre comment fonctionne Kubernetes, et qui permet de préparer la CKA.

La CKA est la certification d’administration de Kubernetes. Elle démontre donc qu’on sait installer un cluster sur des machines, qu’elles soient virtuelles ou physiques.

Ce guide est basé sur mon repo de préparation de la CKA que vous pouvez trouver ici: <https://github.com/alijahnas/CKA-practice-exercises/>

Durant le passage de la CKA, vous pourrez utiliser uniquement la documentation officielle de Kubernetes que vous pouvez trouver ici: <https://kubernetes.io/docs/>

Vous y trouverez la plupart des réponses qu’on vous demande, il faut surtout savoir chercher pour ne pas avoir à retenir toutes les commandes par cœur.

# Pod

Kubernetes est un orchestrateur de containers, mais la brique la plus petite qu’il utilise est ce qu’on appelle un pod. Donc en réalité, Kubernetes orchestre des pods.

Un pod est constitué d’un ou plusieurs containers, avec 0 ou plusieurs volumes (on verra cette notion plus tard).

![](https://lh6.googleusercontent.com/r__K9cZJRhUNXHJGL8HQO7KQLANLohgirkdmPlVTjx6_wv1t6CWgzcJm-LCcf3IQx3mzbsdWvAFsmokbkdofAEDdt7jlWpBFclE2AM9-cdOqZ9l-Nv0AooRyYH_mKHvyNN5opyx2OA3tx_z5Yz2BaVM)

La plupart du temps, on retrouve un seul container par pod. Ce container lance un seul processus (application) qui rend un service. L’architecture micro-service tire avantage des containers et du scheduling des pods par kubernetes pour avoir facilement plusieurs services qui tournent séparément dans des containers/pods et qui communiquent via le réseau. Ces services peuvent chacun monter à l’échelle (scale en anglais) lorsqu’ils ont un pic de charge, et ils peuvent aussi être mis à jour par les développeurs séparément, sans toucher aux autres services.

Pourquoi alors est-ce qu’on aurait besoin de plusieurs containers dans un même pod ?

Le principe d’un pod est qu’il est isolé en termes d’espace réseau et de système de fichiers (entre autres). Or parfois on a besoin que des services communiquent entre eux sur le même espace réseau, ou ils ont besoin d’accéder au même volume pour faire des traitements simultanés sur les mêmes données, et ces services ne peuvent pas le faire en étant séparés dans des espaces réseau ou de stockage différents. Du coup on les met dans le même pod.

Un exemple de pod avec plusieurs containers est lorsqu’on utilise un service mesh. Un service mesh comme Istio va mettre des containers du proxy Envoy dans tous les pods qui font partie du mesh. Ce proxy est un container en plus du container applicatif, il sert à intercepter tous les appels vers l’application avant de les laisser passer afin d’avoir une meilleure vision sur le trafic, ou pour des questions de sécurité.

![](https://lh3.googleusercontent.com/UQYCBOpXVHEAykLVtiZrJyimgG5VsDL8Bb4WhLJGivjSO0eB1VKlBkBT--GvGew3QP0ecqyBLvcyt843yO-fbqOptbtyb7_RcLazL-VvSMmKsuwSgtvS-cczNyJk6NGfghzSIrKALWJg1Lfv3x-gMyc)

Il se peut aussi qu’on utilise dans un pod un [Init container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/), qui est démarré avant le démarrage de l’app container qui délivre le service final. L’init container sert à mettre en place certaines choses sur les volumes par exemple avant que l’app container ne démarre.

Un exemple d’init container est l’injection de secrets dans les pods depuis [Vault](https://www.hashicorp.com/blog/injecting-vault-secrets-into-kubernetes-pods-via-a-sidecar#:~:text=to%20include%20an%20Init%20container%20to%20pre%2Dpopulate%20our%20secret). Un init container est ajouté à un pod afin d’aller récupérer un secret sur Vault (par exemple un mot de passe pour l’accès à une base de données) et le mettre dans le système de fichier du pod qui est commun entre tous les containers. Ainsi, l’application dont le container va démarrer après la fin de l’init container pourra se connecter à sa base de données avec le bon mot de passe.

![](https://lh3.googleusercontent.com/CDaecRR3nm4bU2s6cS3tFzcs3bYDEmQ3tlCcxD2kvc1IpLl-tp4gG-kxB0o18SKXr1C7cGG28yXy9L_wvuY6XUU3oam8uH3SumUg-C7VgwsuZWIslx3NgnZE02R1wV0ERgZB5BsXwTDLZEu5q5m2Md4)

## Lancement d’un pod

Nous allons maintenant créer un pod et le voir tourner sur notre cluster (si vous n’avez pas créé de cluster, voici notre guide qui explique la démarche qui servira pour préparer la CKA: lien vers Installation d’un cluster).

Voici la description du pod :

```
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  namespace: ns-nginx
spec:
  containers:
    - name: nginx
      image: nginx:latest
      ports:
    - containerPort: 80
```

**Explications :**

* apiVersion: c’est la version de [l’API kubernetes](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/) qu’on utilise. Il y en a plusieurs : v1, apps/v1, networking.k8s.io/v1, storage.k8s.io/v1
* kind: l’objet qu’on demande dans l’API appelée, ici on demande un pod.
* metadata: des métadonnées sur l’objet (c’est-à-dire des données sur les données)
* name: le nom du pod
* namespace: dans quel espace de nommage sera contenu le pod. Kubernetes permet d’isoler les applications par namespace, un peu comme une boîte où on met l’application et tout ce qu’il lui faut pour tourner (stockage, fichiers de configuration, secrets, services réseau, etc.). Les pods d’un namespace sont accessibles à partir d’un autre, ils ne sont pas coupés les uns des autres par défaut. C’est possible, mais il faut d’autres outils qu’on verra plus tard.
* spec: la spécification de l’objet qu’on demande.
* containers: les containers qu’on inclut dans le pod. Ici, on va demander de créer un pod avec un seul container qui s’appelle nginx, et qui lance comme image de container l’image officielle de nginx, avec le tag latest, c-à-d la dernière version disponible.
* ports: les ports sur lesquels écoutent les containers du pod.

Pour déployer ce pod, on doit d’abord créer le namespace ns-nginx :

```
$ kubectl create ns ns-nginx
```

Ensuite, on peut utiliser la commande kubectl apply et donner le fichier nginx.yaml qui contient la description plus haut pour appliquer la configuration du pod :

```
$ kubectl apply -f nginx.yaml
pod/nginx created
```

Si on est assez rapide, on peut voir le pod en train d’être créé :

```
$ kubectl get pods -n ns-nginx
NAME    READY   STATUS              RESTARTS   AGE
nginx   0/1     ContainerCreating   0          2s

$ kubectl get pods -n ns-nginx
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          14s
```

Le pod a été schédulé sur un des nœuds du cluster. Il tourne bien, mais on ne peut pas en faire grand-chose, car il faudrait pouvoir y accéder depuis notre réseau, configurer le nginx, voir s’il y a besoin d’espace disque, et bien d’autres choses.

Dans les prochains articles, nous verrons d’autres objets kubernetes qui permettent de construire la totalité de l’infrastructure qui permet d’accéder à une application.

<!--EndFragment-->