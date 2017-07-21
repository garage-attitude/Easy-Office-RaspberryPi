## Welcome to Easy Office project

### Configure WiFi

Connect to a specific Wi-Fi by modifying the following file: /etc/wpa_supplicant/wpa_supplicant.conf

Add the following lines in the file /etc/wpa_supplicant/wpa_supplicant.conf:
```markdown
network={
	ssid="_WiFi-First"
	proto=RSN
	key_mgmt=WPA-EAP
	pairwise=CCMP
	auth_alg=OPEN
	eap=PEAP
	identity="YOUR_USER_NAME"
	password="YOUR_PASSWORD"
}
```

### Install Node.js, NPM and gedit (Text Editor)

Open terminal and execute the following command line:
```markdown
sudo apt-get install nodejs npm
sudo apt-get install gedit
```

Check if Node.js and NPM are correctly installed:
```markdown
node -v
npm -v
```

### Correct issue of Node.js version v0.10.29

There are issues with the version of Node.js v0.10.29 that comes preinstalled with Raspbian Jessie 2015-11-21 or newer. It's not possible to install Node.js native add-ons or packages that depend on native add-ons. Attempting to do so will result in a compile error stating that ‘REPLACE_INVALID_UTF8’ is not a member of ‘v8::String’.

There is a Debian Unstable patch that is disputed for fixing the issue. This patch can be manually applied by replacing the following snippet of code:

Open v8.h file in a text editor in sudo mode:
```markdown
sudo gedit /usr/include/nodejs/deps/v8/include/v8.h:
```
And search for those lines of code:
```markdown
  enum WriteOptions {
    NO_OPTIONS = 0,
    HINT_MANY_WRITES_EXPECTED = 1,
    NO_NULL_TERMINATION = 2,
    PRESERVE_ASCII_NULL = 4,
  };
```

And add a last line as below:

```markdown
  enum WriteOptions {
    NO_OPTIONS = 0,
    HINT_MANY_WRITES_EXPECTED = 1,
    NO_NULL_TERMINATION = 2,
    PRESERVE_ASCII_NULL = 4,
    REPLACE_INVALID_UTF8 = 0
  };
```
Note: /usr/include/nodejs/deps/v8/include/v8.h will not exits if npm hasn't been installed.

### Configuration

Make sure that you are connected to the internet before processing the following command lines. Open command prompt and go into 'Documents' directory.
```markdown
cd Documents/
sudo mkdir garage
cd garage/
sudo git init
sudo git pull https://github.com/garage-attitude/Easy-Office-RaspberryPi.git
sudo npm install
sudo npm install nodemon -g
```

Note: You can run the Node.js server manually by executing the following command line in the folder where the easy-office has been pulled:

```markdown
sudo npm run start
```
Don't care about server crashes, it will restart automatically if it crashs (but it won't ;) ) thanks to "forever" npm module. In top of it, each time the git repo is updated, the server will automaticcaly restart with the latest changes from the git repo thanks to the "nodemon" npm module.

### Make node server bootable

Modify the file /etc/rc.local and add the following lines before exit 0:
```markdown
sleep 5
sudo /usr/local/bin/npm run start --prefix /home/pi/Documents/garage/
```

### Contact

For more details, please send an email to kevin.beaulieu@outlook.com
