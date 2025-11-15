---
title: "Cross-Cloud Calibre-Web Library on Azure VM and AWS Route 53"
date: 2025-10-24 
tags: ["Calibre", "SSH", "Azure VM", "Azure NSG", "AWS Route 53", "Certbot", "HTTPS", "Apache","Web", "Ubuntu"]
categories: ["Cloud","AWS", "Azure", "Networking", "Linux"]
description: "Building a secure, scalable e-library with Calibre-Web on Azure VM and DNS routing via AWS Route53."  
featured_image: "images/calibre-web.jpg"
draft: false
show: default
---
I created a cross-cloud digital library using Calibre-Web, hosted on an Azure VM with access routed through an AWS-managed subdomain. This project demonstrates my practical skills in cloud infrastructure, secure deployment, Linux administration, and collaborative access management.

## Architecture
{{< terminal-figure src="calibre-web-architecture.png" alt="Calibre-Web Cross-Cloud Architecture" align="center">}}

## Infrastructure Provisioning

1. Firstly, I provisioned a **Standard B2ats v2 Azure VM** running Ubuntu for its cost-efficient cloud base.
    
    {{< terminal-figure src="azure-calibre-vm.png" alt="Azure VM Calibre Web" align="center">}}
    
2. Then, I allocated a static public IP to the VM for predictable DNS routing.
    
    {{< terminal-figure src="calibre-static-ip.png" alt="Calibre Web Static Public IP" align="center">}}
    
1. I already have a DNS service on AWS which is **AWS Route53**, so I decided that is where I will create an A record for my secret subdomain `<secretsubdomain>.joshcarl.dev`, pointing directly to my Azure VM’s public IP. 

{{< note type="info">}}
I obfuscated my subdomain to reduce exposure to automated web fuzzing and minimize traffic since this is for private purposes only.
{{< /note >}}

{{< terminal-figure src="route-53-calibreweb.png" alt="AWS Route53 Subdomain Setup" align="center">}}

### Security Groups

1. I adjusted **Azure Network Security Groups (NSG)** to allow only required ports:
    
    - SSH (22) for initial setup (will disable after)
    - HTTP (80) and HTTPS (443) for secure web access
    
    {{< terminal-figure src="calibreweb-nsg.png" alt="Calibre Web Network Security Group" align="center">}}
    
1. Then on Ubuntu I enabled UFW to mirror these restrictions locally.
    
```bash
sudo ufw allow 22 sudo ufw allow 80 sudo ufw allow 443 sudo ufw enable

```

## Installing the GUI

1. I SSH'd into the VM and I updated and installed all prerequisites:

```bash
sudo apt update && sudo apt upgrade -y sudo apt install -y python3 python3-pip git calibre git clone https://github.com/janeczku/calibre-web.git cd calibre-web pip3 install -r requirements.txt

```
2. To configure Calibre Desktop (needed for initial library creation/import), I installed **TigerVNC** and the lightweight **i3 window manager** for remote GUI access.

```bash
sudo apt install -y tigervnc-standalone-server tigervnc-common i3 vncserver :1 -geometry 1280x800 -depth 24

```

3. I tunneled VNC through SSH from my Windows PC, instead of exposing a VNC port to the public.
    
```bash
ssh -L 5901:localhost:5901 "zero@<azure-vm-ip>"

```

{{< terminal-figure src="calibreweb-vnc-tunnel.png" alt="VNC on Calibre Web with i3" align="center">}}

4. Then, I created the library at `/home/zero/calibre-web/library` and imported study guides using the "Add Books" method.

## Launching Calibre-Web

1. I ran the python script for calibre-web:


```bash
cd ~/calibre-web python3 cps.py

```


2. The web admin login was set up successfully pointing to `/home/zero/calibre-web/library/metadata.db`. Then, I immediately updated the admin password for security.

3. Then I added users for my friends and club members. (Credential rotation is performed weekly to protect against leaks, especially with shared login).
## Secure File Transfer with SFTP

1. I enabled SSH key authentication for SFTP, using my existing `.pem` file or converting to `.ppk` for FileZilla.
2. Uploaded books are staged to `/home/zero/uploads/` then imported via Calibre Desktop or the CLI.
    {{< terminal-figure src="calibreweb-filezilla-sftp.png" alt="FileZilla SFTP Transfer for Calibre" align="center">}}

### Importing books via CLI

For automated or large batch imports:

```bash
calibredb add --library-path /home/zero/calibre-web/library --recurse /home/zero/uploads/

```


{{< note type="warning">}}
Make sure that the desktop GUI is closed when running `calibredb` command to avoid DB lock issues
{{< /note >}}


## Enabling HTTPS

1. I installed Certbot with Apache plugin and requested a certificate:

```bash
sudo apt-get install -y certbot python3-certbot-apache sudo certbot --apache -d "<secretsubdomain>.joshcarl.dev"

```
2. Then, I forced all HTTP traffic to redirect to HTTPS for optimal security:
    
```
<VirtualHost *:80>     
ServerName <secretsubdomain>.joshcarl.dev    
Redirect permanent / https://<secretsubdomain>.joshcarl.dev/ 
</VirtualHost>

```

``` bash
sudo systemctl reload apache2

```

## Finalization

Now since all are ready and working, to keep my Calibre-Web running even after reboot I created a service and enabled it:


```bash
sudo nano /etc/systemd/system/calibre-web.service

```

```
[Unit] Description=Calibre-Web After=network.target 
[Service] Type=simple User=zero WorkingDirectory=/home/zero/calibre-web ExecStart=/usr/bin/python3 /home/zero/calibre-web/cps.py Restart=always [Install] WantedBy=multi-user.target
```

```bash 
sudo systemctl enable calibre-web sudo systemctl start calibre-web

```
After checking the status of the service. Calibre-Web service is successfully running.
{{< terminal-figure src="calibreweb-systemd.png" alt="Calibre-Web Systemd Service" align="center">}}


## Conclusion

I successfully configured and built a calibre library website in multiple cloud services (Azure and AWS), with secure Linux practices, and collaborative resource sharing for technical groups. From VM provisioning, DNS routing across AWS and Azure, VNC/i3 desktop access, secure file transfers, Apache HTTPS, systemd-based automation, and rotating credentials.

My personal Calibre-Web platform now serves as my study team's ebook knowledge hub and for my personal studying use with controlled environment and privacy-focused ebook sharing platform.

