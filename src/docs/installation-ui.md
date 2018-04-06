---
id: installation-ui
title: Installation NexentaEdge DevOps Edition UI
sidebar_label: Installation UI
---

NexentaEdge DevOps Edition UI is shipped as Docker container.
Command to run the container:

```bash
docker run -d -e API_ENDPOINT=http://10.0.0.10:8080 -p 3000:3000 -p 3443:3443 nexenta/nedgeui:2.1.3
```
After running container open `https://10.0.0.10:3443` in the browser.

## Environment variables
| Required | Name | Example | Description |
|----------|------|---------|-------------|             
| * | API_ENDPOINT | http://10.0.0.10:8080 | NexentaEdge management node IP address |
|   | SESSION_MAX_AGE_MINUTES | 60 | Login session timeout |

## Default ports inside container
```bash
3000 - HTTP port
3443 - HTTPs port
```

To update Docker image run:

```bash
docker pull nexenta/nedgeui:2.1.3
```

Connect to port 3000 or 3433 and you should see awesome GUI:

![fig1: awesome_gui](https://raw.githubusercontent.com/Nexenta/edge-dev/master/images/nedgeui-s3svc.png)
