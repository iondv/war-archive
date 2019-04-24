# IONDV. War archive

IONDV. War archive is the IONDV. Framework web-application designed to store, group and demonstrate the data based on archival documents about Great Patriotic War [World War II] so that the documents of the Khabarovsk Territory of Russia connected with the Great Patriotic War become more accessible to people.

The app is available only in russian.

<h1 align="center"> <a href="https://www.iondv.com/"><img src="/images/wow.png" alt="IONDV. Framework" align="center"></a>
</h1>  

## Описание  

**IONDV. War archive** - это программное решение на основе IONDV. Framework, реализованное для действующего проекта "Вспомнить каждого", цель которого оцифровать архивные документы, внести информацию в базу и обеспечить к ним свободный доступ. Система позволила создать базу данных архивных документов с более чем 24500 записями 11 районов Хабаровского края. Всего было обработано более 87 дел (более 10 тыс. страниц в 249 томах).

### Модули

Основу реестра данных составляет [модуль Регистри](https://github.com/iondv/registry). Также использовались: [Административный модуль](https://github.com/iondv/ionadmin), [модуль Портала](https://github.com/iondv/portal) и [модуль Дашборда](https://github.com/iondv/dashboard).  

## Как получить?  

### Git

Быстрый старт с использованием репозитория IONDV. War archive на GitHub — [подробная инструкция](https://github.com/iondv/framework/blob/master/docs/ru/readme.md#быстрый-старт-с-использованием-репозитория).  

1. Установите системное окружение и глобальные зависимости.
2. Клонируйте ядро, модуль и приложение.
3. Соберите и разверните приложение.
4. Запустите.

### Docker

Запуск приложения с использованием докер контейнера - [подробная инструкция](https://hub.docker.com/r/iondv/war-archive).

1. Запустите СУБД mongodb: `docker run --name mongodb -v mongodb_data:/data/db -p 27017:27017 -d mongo`
2. Запустите IONDV. War archive `docker run -d -p 80:8888 --link mongodb iondv/war-archive`.
3. Откройте ссылку `http://localhost` в браузере. Для бек офиса логин: demo, пароль: ion-demo 

## Ссылки

Для дополнительной информации смотрите следующие ресурсы:

* [iondv.com](https://iondv.com/)  
* [Портал "Вспомнить каждого"](http://vov.gahk.ru/portal/index)
* Дальневосточный центра социальных технологий о проекте ["Вспомнить каждого"](https://dvcst.ru/projects/item_19.html)

--------------------------------------------------------------------------  


#### [Licence](/LICENSE) &ensp;  [Contact us](mailto:info@iondv.com) &ensp; [Stack Overflow](https://stackoverflow.com/questions/tagged/iondv) &ensp; [FAQs](/faqs.md)          
<div><img src="https://mc.iondv.com/watch/github/docs/app/war-arvhive" style="position:absolute; left:-9999px;" height=1 width=1 alt="iondv metrics"></div>


--------------------------------------------------------------------------  

Copyright (c) 2018 **Autonomous non-profit organization "Far Eastern Center for Social Technologies"**.  
All rights reserved.  

