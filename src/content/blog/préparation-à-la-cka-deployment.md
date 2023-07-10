---
image: /uploads/cka.jpg
title: Préparation à la CKA - Deployment
category: DevOps
date: 2023-06-23T08:34:50.729Z
author: Ali Sanhaji
description: Cet article est le deuxième d’une longue série qui aura pour but
  d’apprendre et de comprendre comment fonctionne Kubernetes, et qui permet de
  préparer la CKA.
---
<!--StartFragment-->

# Avant-propos

Bonjour à tous les curieux de kubernetes,

Cet article est le deuxième d’une longue série qui aura pour but d’apprendre et de comprendre comment fonctionne Kubernetes, et qui permet de préparer la CKA.

La CKA est la certification d’administration de Kubernetes. Elle démontre donc qu’on sait installer un cluster sur des machines, qu’elles soient virtuelles ou physiques.

Ce guide est basé sur mon repo de préparation de la CKA que vous pouvez trouver ici: <https://github.com/alijahnas/CKA-practice-exercises/>

Durant le passage de la CKA, vous pourrez utiliser uniquement la documentation officielle de Kubernetes que vous pouvez trouver ici: <https://kubernetes.io/docs/>

Vous y trouverez la plupart des réponses qu’on vous demande, il faut surtout savoir chercher pour ne pas avoir à retenir toutes les commandes par cœur.

# Deployment

Dans l’article précédent (lien vers l’article Pod) nous avons vu comment lancer un pod sur Kubernetes. Un pod contient en général une application ou un micro-service qui fait partie d’un ensemble de micro-services qui fournissent un service plus global comme par exemple une application web pour faire ses courses alimentaires.

On pourrait mettre chaque micro-service dans un pod et déployer autant de pod que nécessaire, ajouter des pods quand il y a du trafic (par exemple en fin de mois pour les courses alimentaires). L’intérêt de Kubernetes, en tant qu’orchestrateur, est qu’il fait ça à notre place. On lui donne un ensemble de nœuds, et un ensemble de pods, et il se débrouille pour mettre les pods sur les nœuds en optimisant le placement, et en faisant en sorte d’augmenter le nombre de pods quand il y a plus de trafic.

Nous allons voir dans cet article l’objet Deployment, qui permet de dire à Kubernetes comment on veut s’occuper du déploiement d’un pod.

Pour la [CKA](https://github.com/alijahnas/CKA-practice-exercises/blob/CKA-v1.23/workloads-scheduling.md#understand-deployments-and-how-to-perform-rolling-update-and-rollbacks), on est contraint par le temps. Écrire tout le fichier YAML de spécification d’un déploiement est fastidieux. Il vaut mieux passer par une commande kubectl pour générer le fichier YAML, qu’on pourra modifier s’il le faut :

```
$ kubectl -n ns-nginx create deployment nginx-deploy --replicas=3 --image=nginx:latest --dry-run=client -o yaml > nginx-deploy.yaml
```

Si on ouvre nginx-deploy.yaml, on voit ça (j’ai enlevé les lignes qui ne servaient à rien) :

```
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nginx-deploy
  name: nginx-deploy
  namespace: ns-nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx-deploy
  template:
    metadata:
      labels:
        app: nginx-deploy
    spec:
      containers:
  - image: nginx:1.22
        name: nginx
        ports:
  - containerPort: 80
```

**Explications :**

* spec : c’est la spécification du deployment
* replicas : combien de pods on veut, le deployment se chargera de toujours garder ce nombre de pods. Donc si un pod est tombé pour on ne sait quel raison, et qu’il n’y a plus que 2 sur les trois qui tournent, le deployment fera en sorte de redémarrer le troisième.
* selector : on dit au deployment quels pods il doit contrôler en lui spécifiant le label du pod.
* template : c’est la description du pod qui sera contrôlé par le deployment, description qu’on a vu dans le précédent article (lien vers l’article Pod).
* labels : le label du pod à contrôler.
* spec : la spécification du pod avec les containers à déployer

On doit d’abord créer le namespace ns-nginx si ce n’est pas déjà fait :

```
$ kubectl create ns ns-nginx
```

On est prêt à apply le deployment :

```
$ kubectl apply -f nginx-deploy.yaml
```

On peut voir où en est le deployment :

```
$ kubectl -n ns-nginx rollout status deployment/nginx-deploy
deployment "nginx-deploy" successfully rolled out

$ kubectl -n ns-nginx get deploy
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deploy   3/3     3            3           44s
```

On peut voir les pods qui ont été créés suite au deployment

```
kubectl -n ns-nginx get pods -o wide
NAME                            READY   STATUS    RESTARTS   AGE   IP           NODE         NOMINATED NODE   READINESS GATES
nginx-deploy-5c8bfcc47c-7wxl6   1/1     Running   0          18s   10.244.2.5   k8s-node-2   <none>           <none>
nginx-deploy-5c8bfcc47c-jc86s   1/1     Running   0          18s   10.244.1.7   k8s-node-1   <none>           <none>
nginx-deploy-5c8bfcc47c-lgwtg   1/1     Running   0          18s   10.244.1.6   k8s-node-1   <none>           <none>
```

On voit bien que le deployment a créé les trois pods qu’on lui a demandés. Et il se chargera de toujours en garder trois qui tournent dans le cluster. S’il y en a un des trois qui crash, il va en relancer un nouveau sur le même nœud ou sur un nouveau nœud pour toujours en avoir trois. S’il n’arrive pas à avoir trois pods qui tournent en même temps, il nous lancera une erreur.

Dans le prochain article, nous parlerons de replicaset et nous verrons comment gérer les deployments pour jouer avec le nombre de replicas et les images des pods.

<!--EndFragment-->