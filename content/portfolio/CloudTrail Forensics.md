---
title: "CloudTrail Forensics: Investigating and Hardening a Hacked Website"
date: 2025-10-16
tags: ["CloudTrail", "Amazon Athena", "Logs", "Forensics", "Incident Response"]
categories: ["Cloud", "AWS", "Security", "Linux"]
description: " Executed a full security incident response on a simulated website breach. Used AWS CloudTrail for forensic analysis and leveraged Amazon Athena to query API logs."
featured_image: "/images/cloudtrail.png"
draft: false
show: default
---
[AWS CloudTrail](https://aws.amazon.com/cloudtrail/) is an AWS service that generates logs of calls to the AWS application
programming interface (API). CloudTrail can record
all activity against the services that it monitors. It enables governance, compliance,
operational auditing, and risk auditing of AWS accounts.

## Scenario

Martha and Frank are concerned because the website was hacked. They want to discover who did it and to make sure that it does not happen again.

Faythe, Frank, Martha, and others make frequent changes to the website, and sometimes those changes cause issues. Martha and Frank are asking Sofîa if there is a way to track what was changed and who made the changes.

{{< note type="info">}}
This is a fictional scenario that is simulated within a lab environment.
{{< /note >}}

## Architecture

{{< terminal-figure src="cloudtrail-architecture.png" alt="CloudTrail Architecture" align="center">}}
## Modifying a security group

My first action was a pre-emptive administrative change to the Café Web Server's network security. 

1. I accessed the EC2 service and navigated to the Café Web Server instance to inspect its associated Security Group (initially only allowing HTTP/Port 80).
2. I performed a controlled administrative change by adding a new inbound rule for SSH (Port 22).
3. I restricted the Source to _only my IP address_ ( `<MY IP>/32`).

After saving my rule, I quickly checked the live website by navigating to its Public IPv4 address.

I confirmed that the website loaded normally, displaying the expected images and content.

{{< terminal-figure src="cafe-website.png" alt="Cafe Website" align="center">}}

## Creating a CloudTrail log

My next critical step was to ensure I had the necessary audit tool in place before the anticipated next phase of the attack occurred.

- I configured the trail with the required settings: I named the trail `monitor` and secured the logs by sending them to an encrypted S3 bucket (a new bucket named `monitoring####`), protected by a custom KMS key.
    
- I finalized the trail creation, ensuring it was active and logging all management events in my account.

	After waiting some time I noticed a strange image in the website. The website was defaced unkowingly. 
	
{{< terminal-figure src="defaced-website.png" alt="Cafe Website Hacked" align="center">}}

Navigating back to the security groups, a new, unauthorized rule had appeared. Someone had added an entry allowing Secure Shell (SSH) access from _anywhere_ (`0.0.0.0/0`).

## Analyzing the CloudTrail logs

With the evidence collected in the S3 bucket, I began the investigation. The goal here was to find the user who called the `AuthorizeSecurityGroupIngress` API for `0.0.0.0/0`.

- I used the **AWS CLI** (`aws s3 cp`) to recursively download all the compressed `.json.gz` log files from the `monitoring####` S3 bucket.
    
- Then I used the `gunzip` utility to extract the raw JSON logs, preparing them for analysis.

I attempted to analyze the verbose, JSON-formatted logs using Linux command-line tools. I first used  `cat <filename.json> | python -m json.tool` to format the logs for readability.

- I ran bash `for` loops combined with `grep` to try and filter on fields like `sourceIPAddress` and `eventName`.

- I also attempted to use AWS CLI `lookup-events` commands, trying to filter by `ResourceType=AWS::EC2::SecurityGroup` and then piping the results to `grep` for the specific Security Group ID (`sgId`).

Findings: These steps helped me understand the log structure but I realized that using command-line tools like `grep` across multiple, nested JSON files was tedious and inefficient.  I needed a better tool.

## Amazon Athena

The limitations of the command line led me to Amazon Athena, a serverless query service perfect for analyzing massive datasets stored directly in S3 using standard SQL.

[Amazon Athena](https://aws.amazon.com/athena/) is a serverless interactive query service, to run standard SQL queries directly against the large volume of CloudTrail logs stored in Amazon S3, ensuring fast, cost-effective forensic analysis without needing any ETL processes.

- I utilized the CloudTrail console's "Create Athena table" feature to automatically generate the necessary `CREATE EXTERNAL TABLE` statement.
    
- This statement defined the schema (`cloudtrail_logs_monitoring####`), mapping each JSON field in the log records to a corresponding SQL column.
    
- I finalized the table creation, effectively treating the raw S3 logs as a ready-to-query database.

## Identifying the Hacker

I navigated to the **Athena Query Editor** and began the real forensic work. After setting my query results location, I ran initial exploratory queries:

```SQL
SELECT useridentity.userName, eventtime, eventsource, eventname, requestparameters
FROM cloudtrail_logs_monitoring####
LIMIT 30
```

This gave me a feel for the data. I then focused my SQL power to find the decisive log entry:

I filtered by the AWS service involved: `WHERE eventsource = 'ec2.amazonaws.com'`
    
```SQL
SELECT useridentity.userName, eventtime, eventsource, eventname, requestparameters
FROM cloudtrail_logs_monitoring####
WHERE eventsource = 'ec2.amazonaws.com'
```
I refined the search to look for the API call that modifies inbound rules: `AND eventname = 'AuthorizeSecurityGroupIngress'`

```SQL
SELECT useridentity.userName, eventtime, eventsource, eventname, requestparameters
FROM cloudtrail_logs_monitoring9966
WHERE eventsource = 'ec2.amazonaws.com'
AND eventname = 'AuthorizeSecurityGroupIngress'
```


{{< terminal-figure src="hackerfound-cloudtrail.png" alt="Amazon Athena Query" align="center">}}
## Security Remediation

With the threat identified, I immediately moved to secure the environment and clean up the damage.

### Removing the Intruder from the Server

1. I used `sudo aureport --auth` and `who` in the SSH terminal to find evidence of the attacker on the EC2 host. I discovered a live session for a user named `chaos-user`.
    
2. I used `sudo kill -9 [ProcessID]` to forcibly terminate their active session.
    
3. I then successfully deleted the malicious OS user with `sudo userdel -r chaos-user`.
    
4. I verified no other suspicious users remained using `sudo cat /etc/passwd | grep -v nologin`.

5. I checked the SSH daemon configuration (`/etc/ssh/sshd_config`) and made a critical discovery: the hacker had enabled `PasswordAuthentication yes`! This allowed them to log in without needing a key pair.

6. I immediately secured the file using `sudo vi /etc/ssh/sshd_config`:

7. I commented out the `PasswordAuthentication yes` line.
    
8. I uncommented the line to enforce `PasswordAuthentication no`.
    
9. I ran `sudo service sshd restart` to apply the fix, ensuring that only users with the correct key pair could connect.
    

Then, I returned to the EC2 console and deleted the hacker's Port 22/`0.0.0.0/0` inbound rule from the Security Group.

I navigated to the website's image directory (`/var/www/html/cafe/images/`). I found that the hacker had kindly left a backup of the original image. I restored the site by running:

```bash
sudo mv Coffee-and-Pastries.backup Coffee-and-Pastries.jpg
```

The final step was eliminating the attacker's IAM presence. I went to the IAM console and permanently deleted the user `chaos`. 

## Conclusion

This project successfully transitioned from a simulated security panic to a structured, auditable **incident response**. I demonstrated the vital importance of AWS CloudTrail. The project validated that pairing CloudTrail with the massive data querying power of Amazon Athena is the an effective way to perform cloud forensics.

I discovered the culprit (`chaos`) and implemented critical security hardening by removing the malicious OS user, disabling password authentication for SSH, and deleting the rogue IAM user. These actions effectively minimized the attack surface, leaving the Café team with a more secure and auditable infrastructure.

