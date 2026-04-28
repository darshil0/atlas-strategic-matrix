import { useEffect, Dispatch, SetStateAction } from "react";
import { Message, Plan } from "@types";
import { PersistenceService } from "@services/core/persistence";

/**
 * Hook to handle synchronization between application state and local storage.
 */
export function usePersistence(
  messages: Message[],
  setMessages: Dispatch<SetStateAction<Message[]>>,
  currentPlan: Plan | null,
  setCurrentPlan: Dispatch<SetStateAction<Plan | null>>
) {
  // Initial Load
  useEffect(() => {
    const savedMessages = PersistenceService.getMessages();
    const savedPlan = PersistenceService.getPlan();
    if (savedMessages.length > 0) setMessages(savedMessages);
    if (savedPlan) setCurrentPlan(savedPlan);
  }, [setMessages, setCurrentPlan]);

  // Persist Messages
  useEffect(() => {
    PersistenceService.saveMessages(messages);
  }, [messages]);

  // Persist Plan
  useEffect(() => {
    PersistenceService.savePlan(currentPlan);
  }, [currentPlan]);
}
