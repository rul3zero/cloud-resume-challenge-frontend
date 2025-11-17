---
title: "Building My Cloud Resume: A 3 Months Journey with Terraform and AWS"
date: 2025-11-17
tags: ["AWS", "Terraform", "CI/CD", "GitHub Actions", "Lambda", "DynamoDB", "CloudFront", "S3", "API Gateway"]
categories: ["Cloud", "AWS", "DevOps"]
description: "My complete Cloud Resume Challenge implementation using Terraform for Infrastructure as Code. Built a scalable, production-ready website with visitor tracking, bot protection, and automated CI/CD deployment that is deployable in minutes."
featured_image: "/images/cloud-resume-challenge/cloudresumechallengefeatured.png"
draft: false
show: important
---

You're looking at the result of a 3 months journey that transformed my understanding of cloud architecture.

This website isn't just an ordinary website, it's a fully automated, production-grade AWS infrastructure that I can tear down and rebuild in minutes.

## The Challenge

The [Cloud Resume Challenge](https://cloudresumechallenge.dev/) is designed to bridge the gap between certification knowledge and real-world cloud engineering. 

I started this challenge since my AWS re/Start journey. This challenge is not a part of the program rather it's a personal commitment I made.

I needed to prove I could build something real.

The requirements seemed straightforward: build a resume website with a visitor counter using AWS services. But it's not that easy.

## Architecture

{{< terminal-figure src="cloud-resume-challenge/cloud-resume-challenge-final.png" alt="Cloud Resume Challenge Architecture" align="center">}}

As you can see, I designed a serverless architecture that separates frontend and backend concerns. 

The frontend uses Hugo static site generation deployed to S3 with CloudFront CDN for global distribution. 

The backend implements a visitor counter through API Gateway triggering Lambda functions that interact with DynamoDB.

What makes this different is the Infrastructure as Code approach. Everything from S3 buckets to Lambda functions is defined in Terraform. 

No more manual clicking through the AWS console (*relief*). Just code.

## Learning Curve

Terraform was the biggest challenge. I spent weeks researching AWS services, understanding how they connect, and learning Terraform's declarative syntax. The documentation became my constant companion.

The breakthrough came when I understood Terraform's state management. I configured remote state in S3 with DynamoDB locking, enabling automated deployments through GitHub Actions. 

My CI/CD pipeline could deploy infrastructure changes automatically while preventing the deletion of existing resources.

I structured the Terraform modules logically: `api.tf` for backend services, `cdn.tf` for CloudFront distribution, `dns.tf` for Route53 and certificates, and `storage.tf` for S3 configuration.

## Security Implementation

I went beyond basic functionality to implement production-grade security. The visitor counter includes Google reCAPTCHA v3 for bot protection and IP-based rate limiting using DynamoDB TTL. CloudFront uses Origin Access Control to prevent direct S3 access, and all traffic flows through HTTPS with TLS 1.2+ encryption.

The Lambda functions operate with least-privilege IAM roles, accessing only the DynamoDB table and SNS topics they need. Every permission is explicitly defined in Terraform, following the principle of least privilege.

## CI/CD Pipeline

I built two separate GitHub Actions workflows:

For frontend deployment and one for backend infrastructure. 

When I push changes to the frontend repository, the pipeline automatically builds the Hugo site and syncs it to S3. Backend changes trigger Terraform to plan and apply infrastructure updates.

The automation means I can focus on content and features instead of deployment mechanics. Push to main, and everything deploys automatically. 

It's the magic of the workflow I wanted from the start.

## Not Too Detailed Technicalities

**Frontend**: Built with Hugo for static site generation, custom SCSS for styling, and vanilla JavaScript for interactivity. The visitor counter integrates seamlessly with the backend API, displaying real-time counts with reCAPTCHA validation.

**Backend**: Python Lambda function handles visitor counting with duplicate detection and rate limiting. DynamoDB stores visitor data with TTL for automatic cleanup. API Gateway exposes a REST endpoint with CORS configuration. SNS sends notifications for monitoring.

**Infrastructure**: Terraform manages the complete stack across multiple AWS services. Remote state backend enables team collaboration. Modular structure allows independent updates to different components.

## The Costs?

Running this infrastructure costs approximately $0.50-1.00 monthly. Route53 hosted zone is the primary cost at $0.50. Everything else like Lambda, DynamoDB, API Gateway, S3, CloudFront, stays within AWS free tier limits. 

{{< terminal-figure src="cloud-resume-challenge/mycosts.png" alt="Cloud Resume Challenge Costs" align="center">}}

This is production infrastructure for less than a cup of coffee.

## Challenges and Growth

The hardest part wasn't any single technology. It was understanding how everything fits together. How does CloudFront cache API responses? Why does Lambda need VPC endpoints for DynamoDB access? How do you structure Terraform for maintainability?

I learned by breaking things. I destroyed and rebuilt the infrastructure dozens of times. Each iteration taught me something new about AWS service interactions, Terraform dependencies, or GitHub Actions workflows.

## Learnings

This project taught me that cloud engineering is about understanding patterns, automating and figuring out how to make infrastructure reproducible and maintainable.

I learned that good architecture enables change. My Terraform modules let me swap CloudFront configurations or modify Lambda functions without touching other components. The CI/CD pipeline means deployments are consistent and reversible.

I learned that building is the only way to truly understand. 
**Certifications gave me vocabulary. This project gave me competence.**

## Special Thanks

This project wouldn't exist without the support I received during my AWS re/Start journey.

Special thanks to my mentors who guided me in my AWS journey:

- **Sir James Santos**
- **Sir Patrick Ignacio**
- **Sir JR De Guzman**

Their mentorship and unique specialties transformed me to look into different perspectives in architecting solutions.

## The Result

The **website** you're viewing right now is the result! 

It's deployed on AWS, served through CloudFront, secured with modern practices, and maintainable through code. 

I can provision the entire infrastructure from scratch in minutes using Terraform. But more than the technical achievement, this project represents a mindset shift. 

I don't just know AWS services work, I learned how to build with them. 

I don't just write Terraform, I learned to design the infrastructure. 

I don't just deploy code, I created the systems.

## Source Code

- [Backend Infrastructure](https://github.com/rul3zero/cloud-resume-challenge) - Terraform, Lambda, API Gateway, DynamoDB
- [Frontend Website](https://github.com/rul3zero/cloud-resume-challenge-frontend) - Hugo, SCSS, JavaScript

This is my Cloud Resume Challenge. 
