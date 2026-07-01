# Full-Stack Kubernetes Project Documentation

This document outlines the entire process, architecture, and commands used to build, containerize, deploy, and monitor our Next.js and FastAPI application.

## 1. Local Development (Docker Compose)
We created a FastAPI backend and a Next.js frontend. To run them locally during development, we use Docker Compose.

**Commands:**
- `docker compose up --build` : Builds the images and starts both services locally.
- `docker compose down` : Stops and removes the local containers.

## 2. Containerization (Building Images)
To deploy to Kubernetes, we first need to build standalone Docker images from our source code.

**Commands:**
- `cd backend && docker build -t human-backend:latest .` : Builds the backend image.
- `cd frontend && docker build -t human-frontend:latest .` : Builds the frontend image.

## 3. Kubernetes Deployment (Minikube)
Since we are using Minikube for local Kubernetes testing, we must load our local Docker images into Minikube's internal registry before deploying.

**Commands:**
- `minikube image load human-backend:latest` : Loads backend image into Minikube.
- `minikube image load human-frontend:latest` : Loads frontend image into Minikube.
- `kubectl apply -f k8s/` : Applies all deployment and service configurations to the cluster.

## 4. Accessing the Application
Kubernetes runs the pods internally. To access them from our Mac browser, we use port-forwarding.

**Commands:**
- `kubectl port-forward svc/frontend-service 3000:3000` : Access frontend at localhost:3000.
- `kubectl port-forward svc/backend-service 8000:8000` : Access backend at localhost:8000.

## 5. The Hotfix Process
If a critical bug is found in production, we can deploy a hotfix without downtime.

**Commands:**
1. Fix code locally in `main.py`.
2. `docker build -t human-backend:hotfix-1 .` : Build new hotfix image.
3. `minikube image load human-backend:hotfix-1` : Load hotfix image.
4. `kubectl set image deployment/backend-deployment backend=human-backend:hotfix-1` : Trigger a rolling update with zero downtime.
5. `kubectl rollout status deployment/backend-deployment` : Watch the update progress.

## 6. Cluster Monitoring (Prometheus & Grafana)
We installed the industry-standard monitoring stack to track API metrics and pod health.

**Commands:**
1. `brew install helm` : Install Helm package manager.
2. `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts` : Add repository.
3. `helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace` : Install the full monitoring suite.
4. `kubectl apply -f k8s/backend-servicemonitor.yaml` : Tell Prometheus to scrape our FastAPI `/metrics`.

**Accessing Grafana:**
- `kubectl port-forward svc/prometheus-grafana 8080:80 -n monitoring` : Access Grafana at localhost:8080.
- `kubectl get secret --namespace monitoring -l app.kubernetes.io/component=admin-secret -o jsonpath="{.items[0].data.admin-password}" | base64 --decode` : Retrieve the Grafana admin password.

## 7. Useful Debugging Commands
- `kubectl get pods -A` : See all pods in all namespaces.
- `kubectl logs deployment/backend-deployment` : View backend logs for Python errors.
- `kubectl exec -it deployment/frontend-deployment -- sh` : Open a shell inside the frontend pod for internal testing.
