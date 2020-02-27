def RPA_44(*argv, **kw):
    from sendiRPA import mysql

    conn = mysql.connectServer(hostname = "72.168.201.90", port = 3306, username = "test", password = "Test_12345", username = "test")

    ret = mysql.executeSQL(conn = conn, sqlStr = "insert into getWeather('city', 'weather') values ('%s', '%s')"  % (argv[0]['data']['data']['city'], _text))

    mysql.disconnectServer(conn = conn)

def RPA_43(*argv, **kw):
    from sendiRPA import Email

    Email.send(account = "danndanngo@foxmail.com", passwd = "zsuinalvsxwwcabd", to = ['aijiaqu@163.com', '13411154491@139.com'], subject = "Python发送邮件测试", content = """<p>正文：Python 邮件发送测试...</p><p><a href="https://cn.bing.com/">必应搜索国内版</a></p>""", attachFile = argv[0], server = "smtp.qq.com", port = 465, isSSL = False, timeout = 30000)

def RPA_42(*argv, **kw):
    from sendiRPA import Browser,Excel

    Browser.setText(_browser = argv[1], xpath = "//*[@id='kw']", _text = argv[0].data.city + "天气")

    Browser.click(_browser = argv[1], xpath = "//*[@id='su']")

    _text = Browser.getElementText(_browser = argv[1], xpath = "//*[@id='1']/div[1]/div[1]/a[1]/div[1]/div[2]")

    new_wb = Excel.newExcel()

    new_sht = Excel.openSheet(wb = new_wb, name = "Sheet1")

    Excel.writeRowValue(sht = new_sht, name = "A2", values = [ argv[0].data.city, _text ], isSave = False)

    Excel.saveToExcel(wb = new_wb, filePath = "../resources/水果测试写入.xlsx")

    return "../resources/水果测试写入.xlsx", _text
def RPA_41(*argv, **kw):
    from sendiRPA import TaskDataItem,Browser

    dataDict = TaskDataItem.consumeData(name = "迭代3演示", timeout = 30000)

    hWeb = Browser.openBrowser(driverPath = "C:\\chromedriver\\chromedriver.exe")

    Browser.navigateURL(_browser = hWeb, _url = "www.baidu.com")

    return dataDict, hweb
if __name__ == '__main__':
    dataDict, hweb = RPA_41()
    filePath, _text = RPA_42(dataDict, hweb)
    RPA_43(filePath)
    RPA_44(dataDict, _text)