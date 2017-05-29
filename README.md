## Welcome to Easy Office project

### Create a service to make it bootable on Raspberry PI

In order to make the node js start on Raspberry boot please do the following steps:

```markdown
cd /home/pi/Documents
sudo mkdir GarageProjects
```
Copy git repo of easy-office in that folder and move the executable called "easyOfficeService" in the folder /etc/init.d

Now we can test it:

```markdown
sudo sh /etc/init.d/easyOfficeService start/stop
```
If all goes well we can, finally, make it bootable:

```markdown
sudo update-rc.d easyOfficeService defaults
```
To remove it from boot:

```markdown
sudo update-rc.d -f easyOfficeService remove
```
### Contact

For more details send email to kevin.beaulieu@outlook.com
