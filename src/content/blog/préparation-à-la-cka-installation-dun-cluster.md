---
image: ~/assets/uploads/cka.jpg
title: Préparation à la CKA - 00 - Installation d'un cluster
category: DevOps
date: 2023-06-23T08:14:45.491Z
author: Ali Sanhaji
description: Cet article est le premier d’une longue série qui a pour but
  d’apprendre et de comprendre comment fonctionne Kubernetes, et qui vous permet
  de préparer la CKA dans les meilleures conditions.
---
# Avant-propos

Bonjour à tous les curieux de Kubernetes,

Cet article est le premier d’une longue série qui aura pour but d’apprendre et de comprendre comment fonctionne Kubernetes, et qui permet de préparer la CKA.

La CKA est la certification d’administration de Kubernetes. Elle permet de prouver qu’on sait installer un cluster sur des machines, qu’elles soient virtuelles ou physiques.

Ce guide est basé sur mon repo de préparation de la CKA que vous pouvez trouver ici : <https://github.com/alijahnas/CKA-practice-exercises/>

Durant le passage de la CKA, vous pourrez utiliser uniquement la documentation officielle de Kubernetes que vous pouvez trouver ici : <https://kubernetes.io/docs/>

Vous y trouverez la plupart des réponses qu’on vous demande, il faut surtout savoir chercher pour ne pas avoir à retenir toutes les commandes par cœur.

# Installation d’un cluster

On va voir ensemble les étapes d’installation d’un cluster, comprendre ce qu’on fait à chaque étape, et à quoi correspondent les composants qu’on installe. On finira avec un cluster sur lequel on pourra continuer le guide de préparation à la CKA pour comprendre toutes les notions nécessaires pour non seulement réussir la certification, mais pour être à l’aise avec Kubernetes. On a du pain sur la planche, allez !

Si vous n’avez pas de machines virtuelles dans le cloud pour faire l’installation du cluster, voici comment déployer des VMs sur vos machines Linux (qui ont suffisamment de CPU/RAM) via Terraform avec un provisioner libvirt : <https://github.com/alijahnas/CKA-practice-exercises/blob/CKA-v1.23/cluster-architecture-installation-configuration.md#provision-underlying-infrastructure-to-deploy-a-kubernetes-cluster>

Voici le script Terraform à déployer: <https://github.com/alijahnas/CKA-practice-exercises/blob/CKA-v1.23/terraform/cluster-infra.tf>

Nous allons utiliser des OS Ubuntu 20.04 pour l’installation de Kubernetes v1.23. Nous aurons besoin de trois VMs : une VM qui servira de Control Plane (on ne dit plus Master) et deux autres VMs qui serviront de Nodes (on ne dit plus Worker et encore moins Slave).

Il est possible d’installer Kubernetes de zéro comme le fait le célèbre guide de Kelsey Hightower : <https://github.com/kelseyhightower/kubernetes-the-hard-way/>

Installer k8s de zéro (à partir des binaires) permet de comprendre encore plus finement le fonctionnement de l’orchestrateur. Mais cela demande beaucoup d’effort et comporte des risques d’erreur. La CKA ne demande pas de savoir faire ça de zéro. Nous allons plutôt utiliser [kubeadm](https://kubernetes.io/fr/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/) qui est l’outil communautaire principal pour installer k8s.

Oh, au fait, k8s = Kubernetes, car il y a 8 lettres entre le k et s de Kubernetes.

## Container runtime

Avant de pouvoir utiliser kubeadm, il faut d’abord installer un container runtime (les explications après l’installation) sur Ubuntu: <https://github.com/alijahnas/CKA-practice-exercises/blob/CKA-v1.23/cluster-architecture-installation-configuration.md#install-container-runtime>

Doc officielle : <https://kubernetes.io/docs/setup/production-environment/container-runtimes/>

On commence par installer sur nos trois VMs les modules nécessaires, activer les paramètres système, et installer les outils qui vont nous permettre d’utiliser le container runtime :

```
# containerd preinstall configuration
cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# Setup required sysctl params, these persist across reboots.
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

# Apply sysctl params without reboot
sudo sysctl --system


# Install containerd
## Set up the repository
### Install packages to allow apt to use a repository over HTTPS
sudo apt-get update
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

## Add Docker’s official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

## Add Docker apt repository.
echo \
  "deb \[arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Nous pouvons enfin installer containerd :

```
## Install packages
sudo apt-get update
sudo apt-get install -y \
  containerd.io

# Configure containerd
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml

# Restart containerd
sudo systemctl restart containerd
```

Mais en fait c’est quoi containerd ? Et c’est quoi un container runtime ?

Le container runtime est ce qui va permettre de gérer les containers, et de les lancer sur les nœuds faisant partie du cluster Kubernetes. Kubernetes est l’orchestrateur des containers, le container runtime exécute ce que décide Kubernetes.

Beaucoup de gens connaissent les containers grâce à Docker qui a démocratisé l’utilisation des containers pour les architectures microservice. Docker a été décomposé en plusieurs composants, et il repose aujourd’hui sur des sous-composants indépendants qui sont containerd et runc. Containerd est ce qu’on peut appeler un container runtime de haut niveau, et runc un container runtime de bas niveau. Runc est un binaire qui se charge d'exécuter les containers sur les nœuds, alors que containerd est un daemon (d’où le “d” à la fin) qui aura des fonctions plus haut niveau comme des APIs pour la gestion des containers. Kubernetes va appeler containerd avec les bons paramètres, qui va lui-même utiliser l’outil runc pour exécuter un container.

Aujourd’hui, la communauté k8s a abandonné l’utilisation de docker en tant que container runtime, et passe directement par containerd, ou CRI-O qui est une alternative. Docker a été abandonné par k8s car il rajoutait une couche qui n’apportait rien comparé à containerd, et qui au final ne faisait qu’appeler ce dernier. De plus, il fallait maintenir le code k8s qui concernait docker et containerd, ce qui était un double effort. La communauté k8s a décidé de s’alléger de docker et de ne garder que containerd. Cela ne remet pas en cause l’utilité de docker en tant qu’outil pour développeurs.

## Kubeadm, Control plane

Maintenant que nous avons installé containerd (qui a installé runc en tant que dépendance sur nos machines), nous pouvons lancer l’installation du cluster kubernetes sur nos nœuds grâce à kubeadm.

Nous allons donc installer les outils nécessaires pour ça sur nos trois VMs:

```
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl

sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg

echo "deb \[signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet=1.23.9-00 kubeadm=1.23.9-00 kubectl=1.23.9-00
sudo apt-mark hold kubelet kubeadm kubectl
```

Nous avons installé trois outils:

* kubeadm : qui va nous servir à installer le cluster Kubernetes.
* kubelet : qui est l’agent local de Kubernetes sur chaque machine. C’est lui qui appelle containerd sur les VMs.
* kubectl : qui est l’outil en ligne de commande qui permet de faire des appels aux APIs de Kubernetes. Il s’exécute sur le poste de l’utilisateur pour faire les appels vers les API de k8s.

Nous allons maintenant utiliser kubeadm pour installer notre cluster k8s. Nous commençons par le Control Plane (il faut bien faire vérifier que les VMs ont des hostname différents). Donc sur la machine de Control Plane, il faut faire :

```
sudo kubeadm init --kubernetes-version=1.23.9 --pod-network-cidr=10.244.0.0/16
```

Cette commande initialise le cluster en installant les composants du Control Plane qui sont:

* kube-apiserver : c’est le composant qui écoute les appels API et traite les demandes avant que d’autres composants n’entrent en jeu ;
* etcd : c’est la base de données clé/valeur de kubernetes, c’est là où sont stockées toutes les informations liées à votre cluster. C’est essentiel d’en faire le backup régulier ;
* kube-scheduler : c’est le composant qui va choisir sur quel Node vont être lancés les containers ;
* kube-controller-manager : c’est le composant qui fait plusieurs vérifications sur des objets k8s (par ex., endpoints, service accounts) et fait des modifications sur ces objets si nécessaire.

“kubeadm init” une fois exécutée vous donne en sortie une commande à lancer sur les Nodes pour qu’ils rejoignent les clusters. La commande comporte un token pour que les autres VMs puissent s’authentifier auprès de l’apiserver (qui écoute par défaut sur le port 6443). Lancez cette commande sur les deux autres VMs:

```
sudo kubeadm join 172.16.1.11:6443 --token h8vno9.7eroqaei7v1isdpn \
\--discovery-token-ca-cert-hash sha256:44f1def2a041f116bc024f7e57cdc0cdcc8d8f36f0b942bdd27c7f864f645407
```

Cette commande intègre les VMs au cluster en tant que Nodes sur lesquels vont s’exécuter les containers.

Maintenant on pourrait vérifier avec la commande kubectl que nos VMs forment bien un cluster k8s. Pour cela il nous faudrait récupérer sur le Control Plane le fichier d’accès à notre cluster Kubernetes. Ce fichier a été généré par kubeadm. 

```
# Configure kubectl access
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Mais avant de vérifier que le cluster est en marche, il nous faut faire une dernière étape cruciale : installer un plugin CNI pour faire fonctionner le réseau dans Kubernetes.

## Plugin CNI

Kubernetes est un orchestrateur très modulaire. Il ne gère que le déploiement des containers et leur cycle de vie. Mais les containers, une fois répartis sur les nœuds du cluster, doivent pouvoir communiquer entre eux au niveau réseau. Il nous faut alors un composant qui fasse la gestion du réseau entre les containers du cluster répartis sur les nœuds. 

Il y a plusieurs manières d’organiser le réseau dans Kubernetes. Nous allons choisir Flannel comme plugin CNI, qui crée une couche d’overlay au-dessus du réseau des nœuds afin de faire l'interconnexion des containers.

D’autres CNI existent comme Calico qui utilise BGP pour s’échanger les routes entre les nœuds, Cilium qui utilise eBPF pour accélérer le traitement des paquets, ou les CNI spécifiques des cloud providers comme Azure CNI, AWS VPC CNI, ou GKE CNI qui permettent un accès sans surcouche aux réseaux où résident les nœuds kubernetes.

Flannel utilisera l’espace d’adressage qu’on a spécifié dans la commande kubeadm init pour assigner des adresses aux containers: --pod-network-cidr=10.244.0.0/16

```
# Deploy Flannel as a network plugin
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

Maintenant que Flannel est déployé, nous pouvons vérifier que notre cluster est opérationnel et prêt à accueillir des containers applicatifs :

```
kubectl get nodes
NAME               STATUS   ROLES                  AGE     VERSION
k8s-controlplane   Ready    control-plane,master   4m51s   v1.23.9
k8s-node-1         Ready    <none>                 4m9s    v1.23.9
k8s-node-2         Ready    <none>                 4m8s    v1.23.9
```

Enfin ! Maintenant que le cluster est déployé, nous pouvons continuer notre guide de préparation de la CKA. Dans les prochains articles, nous allons voir comment fonctionnent tous les objets Kubernetes de base (pods, services, volumes, secrets).