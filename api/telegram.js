// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8772953195:AAExmVKlQx-eq-N9wV1jUnE9yDJxW0iZHiM'
const TELEGRAM_CHAT_ID = '6336354629'

import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store counselling requests
let counsellingRequests = []

// Load counselling requests from file if exists
async function loadCounsellingRequests() {
  try {
    const dataPath = join(__dirname, '..', 'data', 'counselling-requests.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    counsellingRequests = JSON.parse(data);
    console.log('✅ Counselling requests loaded:', counsellingRequests.length, 'requests');
  } catch (error) {
    console.log('ℹ️  No existing counselling requests, starting fresh');
  }
}

// Save counselling requests to file
async function saveCounsellingRequests() {
  try {
    const dataPath = join(__dirname, '..', 'data', 'counselling-requests.json');
    await fs.writeFile(dataPath, JSON.stringify(counsellingRequests, null, 2));
  } catch (error) {
    console.error('Error saving counselling requests:', error);
  }
}

// Initialize on module load
loadCounsellingRequests();

// Send message to Telegram
export async function sendTelegramMessage(req, res) {
  try {
    const { name, email, phone, message, type } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    // Store counselling request
    const counsellingRequest = {
      id: Date.now(),
      name: name || 'Anonymous',
      email: email || 'Not provided',
      phone: phone || 'Not provided',
      message,
      type: type || 'General',
      timestamp: new Date().toISOString(),
      status: 'unread'
    }
    
    counsellingRequests.unshift(counsellingRequest)
    
    // Keep only last 100 requests
    if (counsellingRequests.length > 100) {
      counsellingRequests = counsellingRequests.slice(0, 100)
    }
    
    await saveCounsellingRequests()

    // Format message for Telegram
    let telegramMessage = `🔔 *New ${type || 'Message'} from Rankit*\n\n`
    
    if (name) {
      telegramMessage += `👤 *Name:* ${name}\n`
    }
    
    if (email) {
      telegramMessage += `📧 *Email:* ${email}\n`
    }
    
    if (phone) {
      telegramMessage += `📱 *Phone:* ${phone}\n`
    }
    
    telegramMessage += `\n💬 *Message:*\n${message}\n`
    telegramMessage += `\n⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown'
      })
    })

    const data = await response.json()

    if (data.ok) {
      res.json({
        success: true,
        message: 'Message sent to Telegram successfully'
      })
    } else {
      throw new Error(data.description || 'Failed to send message')
    }
  } catch (error) {
    console.error('Telegram error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Get all counselling requests
export async function getCounsellingRequests(req, res) {
  try {
    res.json({
      success: true,
      data: {
        requests: counsellingRequests,
        total: counsellingRequests.length,
        unread: counsellingRequests.filter(r => r.status === 'unread').length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Send contact form to Telegram
export async function sendContactFormToTelegram(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      })
    }

    // Format message for Telegram
    let telegramMessage = `📬 *New Contact Form Submission*\n\n`
    telegramMessage += `👤 *Name:* ${name}\n`
    telegramMessage += `📧 *Email:* ${email}\n`
    
    if (phone) {
      telegramMessage += `📱 *Phone:* ${phone}\n`
    }
    
    if (subject) {
      telegramMessage += `📋 *Subject:* ${subject}\n`
    }
    
    telegramMessage += `\n💬 *Message:*\n${message}\n`
    telegramMessage += `\n⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown'
      })
    })

    const data = await response.json()

    if (data.ok) {
      res.json({
        success: true,
        message: 'Contact form sent to Telegram successfully'
      })
    } else {
      throw new Error(data.description || 'Failed to send message')
    }
  } catch (error) {
    console.error('Telegram error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
