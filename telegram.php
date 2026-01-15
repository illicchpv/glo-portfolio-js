<?php

$name = $_POST['client_name']; // получаем имя клиента
$email = $_POST['client_email']; // получаем почту клиента
$message = $_POST['client_message']; // получаем сообщение клиента

// вводим между кавычек токен бота, который прислал @botfater
$token = "8248596473:AAGBkPMEEbnSsqhW4EaWQwFOQcS917G0hX8"; 
// вставляем номер чата, который можно найти на странице 
// api.telegram.org/botXXXXXXXXX/getUpdates — где XXX это токен бота
$chat_id = "1474436400";

// Собираем данные в один массив 
$arr = array(
  'Клиент: ' => $name,
  'Email: ' => $email,
  'Сообщение: ' => $message
);

// составляем сообщение из данных массива
foreach($arr as $key => $value) {
  $txt .= $key."<b> ". urlencode($value)."</b> "."%0A";
};

// даем команду боту отправить сообщение с текстом
$sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}","r");

if ($sendToTelegram) { 
  return true; // если прошло успешно, возвращаем ответ true
} else {
  return false; // если ошибка, возвращаем false
}
?>