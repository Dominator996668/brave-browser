# Используется в:
#   auth.py
#   git_cl.py
python_version = "2.7"

# Зависимости
wheels = [
    {
        "name": "infra/python/wheels/httplib2-py2_py3",
        "version": "0.10.3"
    },
    {
        "name": "infra/python/wheels/six-py2_py3",
        "version": "1.10.0"
    }
]

def main():
    print("Используемая версия Python:", python_version)
    print("Список зависимостей:")
    for wheel in wheels:
        print("Имя колеса:", wheel["name"], "Версия:", wheel["version"])

if __name__ == "__main__":
    main()
