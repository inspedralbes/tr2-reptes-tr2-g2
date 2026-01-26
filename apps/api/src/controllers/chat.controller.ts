
import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';

const chatService = new ChatService();

export const processChatMessage = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = chatService.processMessage(message);

        return res.status(200).json({
            response,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error processing chat message:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
