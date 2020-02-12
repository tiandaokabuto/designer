from sendiRPA import Browser

hWeb = Browser.openBrowser(executable_path = 'C:\\chromedriver\\chromedriver.exe', delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

Browser.maximizeBrowser(_browser = hWeb, delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

Browser.navigateURL(browser = hWeb, URL = 'https://www.baidu.com', delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

Browser.refresh(_browser = hWeb, delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

Browser.setText(_browser = hWeb, xpath = '//*[@id="kw"]', _text = '天气', _timeout = 10, delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

Browser.click(_browser = hWeb, xpath = '//*[@id="su"]', _timeout = 10, delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

temp_now = Browser.getElementText(_browser = hWeb, xpath = '//span[@class="op_weather4_twoicon_shishi_title"]', _timeout = 10, delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

print("现在气温---{}".format(temp_now))

Browser.closeBrowser(_browser = hWeb, delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

