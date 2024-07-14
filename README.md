# Accountant Application Backend

This branch holds the Flask backend for the Accountant application. 

### Framework
Python 3.11.4 is used along with the Flask framework. 

### Database
MySQL database is deployed on RDS.

### Build
Docker is used to containerize the application. ECR is used as the registry.

### Deploy
ECS is used to create EC2 instances and deploy the container.

## Instructions to Deploy on AWS (ECS)

1. Create an image with x86 platform using the buildx command. (Free tier won't allow ARM. Command is "docker buildx build --platform linux/amd64 -t Accountant_x86 .") 🖼️
2. Upload it to the registry using the AWS commands on ECR. 🚢
3. Create a cluster without Fargate. Make sure to use free-tier options while setting up Auto-Scaling groups, only one EC2 instance should be spun up. ⚙️
4. Create a new task definition. Ensure the network mode is bridge. Host & container ports are specified and the image URI is correct. 📝
5. Create a new service with the latest revision of the task definition. ➕
6. A task should spring up automatically. If not, check the minimum health %. 🔄

## Instructions to Deploy on RDS

1. Create a new DB in the same region and VPC as the ECS cluster above. 🗃️
2. While creating the DB, use all free tier options. 💰
3. Ensure that the DB is not publicly accessible. If selected, VPC charges will apply. 🔒
4. If data needs to be imported/exported, make the DB publicly accessible to make the changes and then change it back. 🔄
