resource aws_iam_user main {
    name = "pallad-config"
}

resource aws_iam_user_policy main {
    name = "pallad-config"
    user = aws_iam_user.main.name
    policy = file("./policy.json")
}

resource aws_iam_access_key main {
    user = aws_iam_user.main.name
}