from sendiRPA import Browser
from clickImage import MouseControl

hWeb = Browser.openBrowser(driverPath = 'C:\\chromedriver\\chromedriver.exe')

MouseControl.scshot_match(ImagePath = "C:\\Users\\Administrator.SC-201902012149\\Desktop\\template.jpg")

