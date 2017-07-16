## Welcome to Easy Office project

### Configure WiFi

Connect to the appropriate WiFi by modifying the following file: /etc/wpa_supplicant/wpa_supplicant.conf

### Install Node.js and NPM

Open terminal and execute the following command line:
```markdown
sudo apt-get install nodejs npm
```

Check if they are correctly installed:
```markdown
node -v
```

and
```markdown
npm -v
```

### Correct issue for version of Node.js v0.10.29

There are issues with the version of Node.js v0.10.29 that comes preinstalled with Raspbian Jessie 2015-11-21 or newer. It's not possible to install Node.js native add-ons or packages that depend on native add-ons. Attempting to do so will result in a compile error stating that ‘REPLACE_INVALID_UTF8’ is not a member of ‘v8::String’.

There is a Debian Unstable patch that is disputed for fixing the issue. This patch can be manully applied by replacing the following snippet of code in /usr/include/nodejs/deps/v8/include/v8.h:

```markdown
  enum WriteOptions {
    NO_OPTIONS = 0,
    HINT_MANY_WRITES_EXPECTED = 1,
    NO_NULL_TERMINATION = 2,
    PRESERVE_ASCII_NULL = 4,
  };
```

with:

```markdown
  enum WriteOptions {
    NO_OPTIONS = 0,
    HINT_MANY_WRITES_EXPECTED = 1,
    NO_NULL_TERMINATION = 2,
    PRESERVE_ASCII_NULL = 4,
    REPLACE_INVALID_UTF8 = 0
  };
```
Note that /usr/include/nodejs/deps/v8/include/v8.h will not exits if npm hasn't been installed.

### Configuration

Make sure that you are connected to the internet before processing the following command lines. Open command prompt and go into 'Documents' directory.
```markdown
sudo mkdir garage
cd garage
sudo git init
sudo git pull https://github.com/garage-attitude/Easy-Office-RaspberryPi.git
sudo npm install
sudo npm run start
```
### Make node server bootable

Not yes finished...

### Contact

For more details send email to kevin.beaulieu@outlook.com
