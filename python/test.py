def RPA_832716bf(*argv, **kw):
    from sendiRPA import Browser

    hWeb = Browser.openBrowser(delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

    suc = Browser.newTab(_browser = hWeb, delayBefore = 1, delayAfter = 1, continue_On_Failure = True)

if __name__ == '__main__':
    RPA_832716bf()
