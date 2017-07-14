## Welcome to Easy Office project

### Create a service to make it bootable on Raspberry PI Zero

In order to make the node js start on Raspberry boot please do the following steps:

```markdown
cd /home/pi/Documents
sudo mkdir garage-projects
sudo npm install forever -g
```
Copy git repo of easy-office in that folder and move the executable called "easyoffice-server" in the folder /etc/init.d

Now we can test it:
```markdown
sudo sh /etc/init.d/easyoffice-server start/stop
```
### Make it bootable
If all goes well we can, finally, make it bootable:
```markdown
sudo update-rc.d easyoffice-server defaults
```
To remove it from boot:
```markdown
sudo update-rc.d -f easyoffice-server remove
```
### Contact

For more details send email to kevin.beaulieu@outlook.com
