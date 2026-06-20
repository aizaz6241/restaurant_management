package com.example.sherafghanorders

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

class ForegroundService : Service() {

    private var wakeLock: PowerManager.WakeLock? = null
    private var pollingThread: Thread? = null
    private var isRunning = false
    private var mediaPlayer: MediaPlayer? = null
    private var isAlarmPlaying = false

    override fun onCreate() {
        super.onCreate()
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SherAfghanOrders::WakeLock").apply {
                acquire()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createNotificationChannel()

        val notificationIntent = Intent(this, MainActivity::class.java)
        val flagsPending = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            flagsPending
        )

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Sher Afghan Orders Active")
            .setContentText("App is running in background to prevent sleep.")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)

        if (!isRunning) {
            startPolling()
        }

        return START_STICKY
    }

    private fun startPolling() {
        isRunning = true
        pollingThread = Thread {
            while (isRunning) {
                try {
                    checkOrdersForAlert()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                try {
                    Thread.sleep(5000) // Poll every 5 seconds as requested by user
                } catch (e: InterruptedException) {
                    break
                }
            }
        }
        pollingThread?.start()
    }

    private fun checkOrdersForAlert() {
        var connection: HttpURLConnection? = null
        try {
            val url = URL("https://restaurant-management-mkrr.onrender.com/api/orders")
            connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.setRequestProperty("x-auth-token", "sher-afghan-admin-session-token")
            connection.connectTimeout = 4000
            connection.readTimeout = 4000
            
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val response = StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    response.append(line)
                }
                reader.close()
                
                val jsonArray = JSONArray(response.toString())
                var hasUnacknowledged = false
                val twentyFourHoursAgo = System.currentTimeMillis() - 24 * 60 * 60 * 1000
                
                val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
                sdf.timeZone = TimeZone.getTimeZone("UTC")
                
                for (i in 0 until jsonArray.length()) {
                    val order = jsonArray.getJSONObject(i)
                    val isAcknowledged = order.optBoolean("isAcknowledged", true)
                    val status = order.optString("status", "")
                    val createdAt = order.optString("createdAt", "")
                    
                    if (!isAcknowledged && status == "Preparing" && createdAt.isNotEmpty()) {
                        try {
                            val datePart = if (createdAt.contains(".")) createdAt.substring(0, createdAt.indexOf(".")) else createdAt
                            val date = sdf.parse(datePart)
                            if (date != null && date.time > twentyFourHoursAgo) {
                                hasUnacknowledged = true
                                break
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }
                
                if (hasUnacknowledged) {
                    playAlarm()
                } else {
                    stopAlarm()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            // In case of error (e.g. no internet/server down), we don't change state, just let next loop try
        } finally {
            connection?.disconnect()
        }
    }

    private fun playAlarm() {
        if (isAlarmPlaying) return
        isAlarmPlaying = true
        
        updateNotification("🚨 NEW ORDER ALERT!", "There is an unacknowledged order. Please check!")
        
        try {
            if (mediaPlayer == null) {
                val alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                    ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(applicationContext, alertUri)
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    isLooping = true
                    prepare()
                }
            }
            mediaPlayer?.start()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun stopAlarm() {
        if (!isAlarmPlaying) return
        isAlarmPlaying = false
        
        updateNotification("Sher Afghan Orders Active", "App is running in background to prevent sleep.")
        
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun updateNotification(title: String, text: String) {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val flagsPending = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            flagsPending
        )

        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentIntent(pendingIntent)
            .setOngoing(true)

        if (title.contains("🚨")) {
            notificationBuilder
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
        } else {
            notificationBuilder
                .setPriority(NotificationCompat.PRIORITY_LOW)
        }

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notificationBuilder.build())
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        pollingThread?.interrupt()
        stopAlarm()
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Foreground Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(serviceChannel)
        }
    }

    companion object {
        private const val CHANNEL_ID = "ForegroundServiceChannel"
        private const val NOTIFICATION_ID = 1
    }
}
