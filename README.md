Node.js APN server
==================

A simple apn server for my *Travian Manager* app. Uses **express** and **mongoose**.

* * *

iOS integration
---------------

Make a POST request to your apn server.

**Register a device token**

1. Send a POST request to `apn.domain.com/register`. Post data should be
  - Device token (`token=xxxxxxxxxxxxxxxxxxxxxxx`)

**Schedule a notification**

1. `POST` to `apn.domain.com/schedule`. Post data should be
  - Device token (`token=xxxxx`)
  - Delivery time as UNIX timestamp (`deliveryTime=1364856393`)
  - Title (`title=My iOS notification`) < urlencoded

For all requests, the server will reply in plain text with either `200` or `400 <message>`. You can use this to check in iOS if the requests are successful.

* * *

CLI
---

This app has built in CLI. To use it, type one of the commands available (whenever).
- `status` prints undelivered notifications.
