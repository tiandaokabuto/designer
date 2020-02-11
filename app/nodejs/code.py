from sendiRPA import browser

hWeb = browser.openBrowser(executable_path = 'C:\\chromedriver\\chromedriver.exe', delayBefore = 12, delayAfter = 1, continue_On_Failure = True)

suc = browser.navigateURL(browser = hWeb, URL = 'about:blank', delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

