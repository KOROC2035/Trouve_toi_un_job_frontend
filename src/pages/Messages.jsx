import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Send, User, MessageSquare } from 'lucide-react';

export default function Messages() {
  const { token, user } = useContext(AuthContext);
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const activeConvRef = useRef(null);

  const API_URL = 'https://trouve-toi-un-job-backend.onrender.com';
  const WS_URL = 'wss://trouve-toi-un-job-backend.onrender.com';

  useEffect(() => {
    activeConvRef.current = activeConversation?.id;
  }, [activeConversation]);

  // 1. Initialiser le WebSocket
  useEffect(() => {
    if (!user?.id) return;

    const socket = new WebSocket(`${WS_URL}/ws/chat/${user.id}`);
    ws.current = socket;

    socket.onopen = () => console.log("Connecté au WebSocket !");

    socket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);
      
      if (activeConvRef.current === incomingMessage.conversation_id) {
        setMessages((prevMessages) => {
          if (prevMessages.find(m => m.id === incomingMessage.id)) return prevMessages;
          return [...prevMessages, incomingMessage];
        });
      }

      setConversations((prevConvs) => 
        prevConvs.map(conv => {
          if (conv.id === incomingMessage.conversation_id && activeConvRef.current !== conv.id) {
            return { ...conv, unread_count: (conv.unread_count || 0) + 1 };
          }
          return conv;
        })
      );

      window.dispatchEvent(new Event('new_message_received'));
    };

    socket.onclose = () => console.log("Déconnecté du WebSocket");

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [user?.id]);

  // 2. Récupérer les conversations
  useEffect(() => {
    if (!token) return;
    
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${API_URL}/conversations/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des conversations", error);
      }
    };
    
    fetchConversations();
  }, [token]);

  // 3. Récupérer l'historique des messages
  useEffect(() => {
    if (!activeConversation || !token) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/conversations/${activeConversation.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des messages", error);
      }
    };

    fetchMessages();
  }, [activeConversation, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpenConversation = (conv) => {
    setActiveConversation(conv);
    
    setConversations(prev => prev.map(c => 
      c.id === conv.id ? { ...c, unread_count: 0 } : c
    ));
    
    setTimeout(() => {
      window.dispatchEvent(new Event('new_message_received'));
    }, 500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !ws.current) return;

    const receiverId = activeConversation.client_id === user.id 
      ? activeConversation.provider_id 
      : activeConversation.client_id;

    const messageData = {
      conversation_id: activeConversation.id,
      receiver_id: receiverId,
      content: newMessage
    };

    ws.current.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  // Helper pour cibler le profil de l'interlocuteur dans la liste
  const getOtherParticipant = (conv) => {
    if (!conv || !user) return null;
    
    // Si je suis le client, mon interlocuteur est le provider (et inversement)
    return conv.client_id === user.id ? conv.provider : conv.client;
  };

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex bg-white dark:bg-brand-navy rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in transition-colors">
      
      {/* Barre latérale : Liste des conversations */}
      <div className="w-1/3 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-brand-orange" />
            Messagerie
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm mt-10">Aucune conversation pour le moment.</div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherParticipant(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv)}
                  className={`w-full text-left p-4 border-b border-gray-50 dark:border-gray-800/50 transition-colors flex items-center justify-between ${
                    activeConversation?.id === conv.id 
                      ? 'bg-brand-orange/5 dark:bg-brand-orange/10 border-l-4 border-l-brand-orange' 
                      : 'hover:bg-gray-50 dark:hover:bg-brand-navy-light border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {otherUser?.profile_photo ? (
                      <img 
                        src={otherUser.profile_photo} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover shrink-0" 
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-brand-navy-light rounded-full flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {otherUser ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'Interlocuteur' : 'Conversation'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {conv.messages?.[conv.messages.length - 1]?.content || 'Nouvelle conversation'}
                      </div>
                    </div>
                  </div>
                  
                  {conv.unread_count > 0 && (
                    <div className="bg-brand-orange text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm ml-2 shrink-0 animate-pulse">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Zone principale : Chat actif */}
      <div className="w-2/3 flex flex-col bg-gray-50 dark:bg-brand-navy-light/30">
        {activeConversation ? (
          <>
            {/* En-tête du chat avec le profil actif */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-navy flex items-center">
              {(() => {
                const otherUser = getOtherParticipant(activeConversation);
                return (
                  <>
                    {otherUser?.profile_photo ? (
                      <img 
                        src={otherUser.profile_photo} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-brand-navy-light rounded-full flex items-center justify-center mr-3 shrink-0">
                        <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {otherUser 
                          ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'Utilisateur inconnu'
                          : 'Discussion'}
                      </h3>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Zone des messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10 text-sm">
                  Envoyez le premier message !
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_id === user.id;
                  const sender = msg.sender;

                  return (
                    <div key={index} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {/* Avatar de l'expéditeur (messages reçus uniquement) */}
                      {!isMe && (
                        sender?.profile_photo ? (
                          <img 
                            src={sender.profile_photo} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full object-cover shrink-0 mb-1" 
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 dark:bg-brand-navy rounded-full flex items-center justify-center shrink-0 mb-1">
                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                        )
                      )}

                      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Nom au-dessus du message récepteur */}
                        {!isMe && sender && (
                          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
                            {sender.first_name} {sender.last_name}
                          </span>
                        )}

                        <div className={`p-3 rounded-2xl shadow-sm ${
                          isMe 
                            ? 'bg-brand-orange text-white rounded-br-none' 
                            : 'bg-white dark:bg-brand-navy text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Champ de saisie */}
            <div className="p-4 bg-white dark:bg-brand-navy border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-sm flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-30 text-brand-orange" />
            <p>Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>
      
    </div>
  );
}