from sendiRPA import Excel

wb, app = Excel.openExcel(filePath = "C:\\Users\Administrator.SC-201902012149\\Desktop\\水果测试.xlsx", visible = True)

sht = Excel.openSheet(wb = wb, name = "Sheet1")

new_wb = Excel.newExcel()

new_sht = Excel.openSheet(wb = new_wb, name = "Sheet1")

rowSize = Excel.getSheetRowSize(sht = sht)

for i in range(1, rowSize + 1):
    values = Excel.readRowValue(sht = sht, name = "A%d" % i)

    Excel.writeRowValue(sht = new_sht, name = "A%d" % i, values = values, isSave = False)

Excel.saveToExcel(wb = new_wb, filePath = "C:\\Users\Administrator.SC-201902012149\\Desktop\\水果测试-新.xlsx")

Excel.closeExcel(wb = wb, app = app, isSave = False)

