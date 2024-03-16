resource aws_secretsmanager_secret json {
    name = "pallad-config-json"
}

resource aws_secretsmanager_secret_version json {
    secret_id     = aws_secretsmanager_secret.json.id
    secret_string = jsonencode({
        foo : "bar",
        nested : {
            baz : "qux"
        }
    })
}

resource aws_secretsmanager_secret raw_string {
    name = "pallad-config-raw"
}

resource aws_secretsmanager_secret_version raw_string {
    secret_id     = aws_secretsmanager_secret.raw_string.id
    secret_string = "raw_string_secret_value"
}
