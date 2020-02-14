from clickImage import MouseControl
from sendiRPA import Browser

MouseControl.scshot_match(ImagePath = "C:\\Users\\Administrator.SC-201902012149\\Desktop\\template.jpg")

Browser.navigateURL(_browser = hWeb, _url = 'about:blank')

