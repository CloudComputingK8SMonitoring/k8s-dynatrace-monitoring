# K8S Dynatrace Monitoring

### Containerizing the multisnake frontend and server
Originally, multisnake was structured as a set of repositories inside a GitHub
organization: multisnake-frontend, multisnake-backend, multisnake-controller
and multisnake-ios.

The two relevant parts here are the multisnake-frontend and multisnake-server
because these need to be hosted somewhere. The multisnake-controller and
multisnake-ios repositories represent mobile apps for Android and IOS
respectively, that are used to control the players movements.

In order to be able to work with this easier, we decided to merge the frontend
and server into a single GitHub monorepo with separate folders for the two
parts.

We added dockerfiles for both the frontend and backend. These files reside
within the respective directories.

Both parts require build-steps, therefore both dockerfiles use a two-stage
design, where the first stage uses an image suited for generating the build,
while the second stage uses a more light weight image for serving the build
output from the first stage. 

The project structure now looks like this:

```
.
├── cloudbuild.yaml
├── ingress.yaml
├── k8s
│   └── deployment.yaml
├── multisnake-architecture.png
├── multisnake-frontend
│   ├── Dockerfile
│   ├── img.png
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── resources
│   ├── server-data-interface.txt
│   ├── src
│   ├── style.css
│   ├── tsconfig.json
│   └── vite.config.mjs
├── multisnake-server
│   ├── Dockerfile
│   ├── multisnake-server
│   └── multisnake-server.sln
├── PROPOSAL.md
└── README.md
```

### Setting up Google Cloud

The first step to getting this project hosted was to log into Google Cloud and to create a new project.
After selecting a name for this project, a payment plan had to be selected.
Next, kubernetes engine was selected and activated for container orchestration, and a cluster was created.

### Configuring Google Cloud build

Google Cloud Build was used for automatic building of Docker images.
First, a trigger to automatically build when changes are pushed to the "build" branch was created.
Next we created the file `cloudbuild.yaml` which can be found in the root of the github repo.

After this we created a repository in "google artifact repository". This is where the build images will be pushed.
Automatically generated hashes will be appended to the image names to be able to distinguish them.


### Installing Kubernetes

Before we can configure kubernetes, the `gcloud-CLI` has to be installed on the developers machine.
This CLI tool allows us to authorize and log into the google cloud.

After this is done, `kubectl` can be installed.
All kubernetes configuration is defined within a single `deployment.yaml` file in the github repo.

Whenever changes are made to the file, they must be manually applied using `kubectl`, as shown below:
```bash
kubectl apply -f deployment.yaml
```

### Configuring Ingress


