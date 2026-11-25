# Итоговый проект DevOps

Node.js, Prometheus и Grafana запускаются одной командой.

```sh
docker compose up -d
```

- http://localhost:3000/ показывает `DevOps Final Project`
- http://localhost:3000/health возвращает `{"status":"ok"}`
- http://localhost:3000/metrics отдаёт метрики Node.js и `http_requests_total`
- http://localhost:9090/targets показывает цель `app`
- http://localhost:3001/d/devops-final/devops-final открывает панель Grafana с данными Prometheus

Генерируй трафик запросами к `/` и `/health`. Счётчик обновляется после завершения HTTP-ответа. Запросы самого Prometheus к `/metrics` в этот счётчик не входят. Grafana работает на локальном адресе с доступом только для просмотра.

## Ansible

Плейбук рассчитан на Ubuntu 24.04. Он проверяет наличие Docker и Compose, устанавливает недостающие пакеты, копирует файлы в `/opt/devops-final` и поднимает стек. Повторный запуск с теми же файлами не меняет состояние.

```sh
ansible-galaxy collection install -r requirements.yml
ansible-playbook -i localhost, deploy.yml --ask-become-pass
```

Для повторного запуска на том же компьютере используй тот же плейбук. Если стек поднят вручную из папки исходников, выполни там `docker compose down` перед переходом на Ansible, чтобы освободить порты.

## CI CD

Workflow выполняет `lint`, затем `test` с PostgreSQL. После push в `main` и прохождения проверок публикует образ `ghcr.io/hzhzhz1291/devops-final-app` с тегами `latest` и SHA коммита.
