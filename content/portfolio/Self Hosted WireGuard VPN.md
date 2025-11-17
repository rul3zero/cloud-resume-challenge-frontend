---
date and time:
  - 2025-09-26 17:38
title: Self Hosted VPN Server on AWS with Ad Blocking DNS
date: 2025-10-20
tags:
  - VPN
  - Wireguard
  - Pihole
  - DNS
  - Adblock
  - Homelab
  - EC2
  - SSH
  - Amazon Linux 2
categories:
  - Cloud
  - AWS
  - Networking
  - Linux
  - Security
description: A self-hosted VPN and ad-blocking system I built to secure my personal internet traffic and enhance online privacy. I deployed a secure and high-performance tunnel WireGuard server with an Ad Blocking DNS on an AWS EC2 instance.
featured_image: /images/wireguard.jpg
draft: false
show: default
---
To gain full control over my internet traffic and enhance my digital privacy, I designed and deployed a personal VPN server on the AWS cloud. I chose WireGuard for its modern cryptography, high performance, and minimal attack surface. My goal was to create a secure and private tunnel for all my devices, especially on untrusted public networks.

I integrated Pi-hole to provide network-wide ad and tracker blocking, creating a cleaner and faster browsing experience for all connected clients. 

This project demonstrates my skills in cloud infrastructure management, network configuration, Linux system administration, and security hardening.
## Architecture

  {{< terminal-figure src="wireguard-vpn-architecture.png" alt="WireGuard Server Architecture" align="center">}}
  
## Cloud Infrastructure Deployment

1. I provisioned a t2.micro EC2 instance running Ubuntu, providing a cost-effective and powerful base for the server.
   
	  {{< terminal-figure src="wireguard-vpn-instance.png" alt="WireGuard VPN Instance" align="center">}}
   
1. I configured the instance's Security Group to act as a stateful firewall. I created a custom rule to allow inbound UDP traffic on my chosen WireGuard port, while restricting all other ports to essential services like SSH.   
   
	  {{< terminal-figure src="wireguard-vpn-sg.png" alt="WireGuard VPN Security Group" align="center">}}
	  
1. Then, I allocated and associated an Elastic IP address with the instance.
	
	  {{< terminal-figure src="wireguard-vpn-elastic.png" alt="WireGuard VPN Static IP" align="center">}}
## WireGuard Server Configuration

With the infrastructure in place, I proceeded to install and configure the WireGuard VPN server software.

1. I SSH'd into the server and installed the wireguard and wireguard-tools packages.
	```bash
	$ sudo dnf install -y wireguard-tools iptables
	$ wg --version
	$ iptables --version
	```
2. To allow the server to route traffic between the VPN interface (wg0) and the public internet interface (eth0), I enabled IPv4 forwarding in the Linux kernel's sysctl configuration.
	```bash
	sudo nano /etc/sysctl.conf
	```
	Then, editing `net.ipv4.ip_forward = 1`
	
3. I generated a secure private and public key pair for the server, which forms the core of WireGuard's identity and encryption.``
	
{{< note type="info">}}
It is very important to modify the permissions of your private keys to read only to authorized users.
{{< /note >}}

```bash
wg genkey | tee server-privatekey | wg pubkey > server-publickey
```

4. I authored the primary configuration file, defining the server's private IP address within the VPN subnet, its listening port, and its private key. I also implemented iptables rules in the PostUp and PostDown hooks to handle NAT, enabling clients to access the internet through the server's public IP.
	
	{{< terminal-figure src="wireguard-vpn-wg0.png" alt="WireGuard VPN Config" align="center">}}

4. Launched the Service: I started and enabled the wg-quick@wg0 systemd service to bring the VPN interface online and ensure it launches on boot.

	 {{< terminal-figure src="wireguard-vpn-start.png" alt="Starting WireGuard Service" align="center">}}

## Client Connection

The final stage involved configuring client devices to connect to the newly created server.

1. For each client device, I generated a separate and unique public/private key pair.
	```bash
	wg genkey | tee client-privatekey | wg pubkey > client-publickey
	```
2. I updated the server's wg0.conf file by adding a [Peer] block for each client. This block registers the client's public key and assigns it a static internal IP address from the VPN subnet.

```
...


[Peer]
# one client which will be setup to use 10.20.10.2 IP
PublicKey = lsZaaSijsu7mpdg3iFrZyIwrtqYMw4ld4JsGWhgTtuGc=
AllowedIPs = 10.20.10.2/32
```

3. After adding the new peer, I reloaded the WireGuard service to apply the changes without downtime.


```bash
sudo systemctl restart wg-quick@wg0.service
```

4. I created a client.conf file for the end-user device. This configuration contains the client's interface details, its private key, and the server's public key and endpoint address. I set AllowedIPs = 0.0.0.0/0 to ensure all of the client's traffic is routed through the VPN tunnel.
   
	{{< terminal-figure src="wireguard-vpn-clientconf.png" alt="WireGuard VPN Client Config" align="center">}}
	
4. I securely transferred the client.conf file to the client device. For mobile devices, I streamlined this process by using qrencode to generate a QR code from the config file, which was then scanned by the WireGuard mobile app for instant setup.

	```bash
	qrencode -t ansiutf8 < client.conf
	```

	{{< terminal-figure src="wireguard-vpn-wgshow.png" alt="Client Connection Status" align="center">}}
---

## Additional Improvements

To improve scalability and functionality, I implemented two key additions.

1. I wrote a bash script that automates the entire client creation process. It generates keys, creates individual client configuration files, and appends the required `[Peer]` sections to the main server configuration file, making bulk onboarding seamless.

2. To add network-wide ad-blocking, I installed Pi-hole on the same server.
    
    - I used the standard Pi-hole installation script.
      ```bash
      curl -sSL https://install.pi-hole.net | bash
      ```
	- I updated the DNS server setting in each client's configuration file to point to the WireGuard server's private IP address (e.g., 10.20.10.1). This forces all DNS queries from VPN clients through Pi-hole, effectively blocking ads and malicious domains before they can be loaded.
	  
	{{< terminal-figure src="wireguard-vpn-pihole.png" alt="Pi Hole DNS Server" align="center">}}

## Conclusion

This project demonstrates my capability to architect and deploy secure, custom network solutions in a cloud environment. I successfully built a personal WireGuard VPN server integrated with a Pi-hole DNS ad-blocker on AWS. The result is a fast, private, and ad-free internet experience that I control completely. This hands-on experience solidified my skills in cloud infrastructure, Linux administration, and network security, proving my ability to take a project from concept to a fully functional and valuable tool.