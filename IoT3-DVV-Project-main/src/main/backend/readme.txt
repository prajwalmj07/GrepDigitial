to run the app 
' uvicorn main:app --reload '
to change the port use 
' uvicorn main:app --reload --port 5000 '

and example query 
    To fetch the data 
        ' http://127.0.0.1:5000/fetch-and-transform?device_serial_number=WR2001000008&start_date=2024-11-07&end_date=2024-11-08&max_pages=50 ' 
    To download the file as csv 
        ' http://127.0.0.1:5000/export?device_serial_number=WR2009000663&start_date=2024-11-07&end_date=2024-11-08&max_pages=50&file_format=csv '
    To download the file as json 
        ' http://127.0.0.1:5000/export?device_serial_number=WR2009000663&start_date=2024-11-07&end_date=2024-11-08&max_pages=50&file_format=json '
