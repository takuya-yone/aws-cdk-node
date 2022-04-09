def handler(event, context):
    statusCode = 200
    body = "Hello from $Latest version" 
    response = {
        'statusCode': statusCode,
        'body': body,
        'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
    }
    return response
