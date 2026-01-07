import { Feedback, NotionPage } from '../../types';
import { isMockMode, FEEDBACK_DB_ID, cleanId, notionRequest } from './client';
import { SubmitFeedbackSchema, safeValidate } from '../validation';
import { logger } from '../logger';

export const getFeedbackForTrace = async (traceId: string): Promise<Feedback[]> => {
  if (isMockMode || !FEEDBACK_DB_ID) return [];

  try {
    const dbId = cleanId(FEEDBACK_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      filter: {
        property: 'Trace',
        relation: { contains: traceId }
      },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    });

    return response.results.map((page: NotionPage) => {
        const props = page.properties;
        const memberRelation = props.Members?.relation || [];
        return {
          id: page.id,
          traceId: traceId,
          comment: props.Comment?.title?.[0]?.plain_text || '',
          rating: props.Rating?.number || 0,
          memberId: memberRelation.length > 0 ? memberRelation[0].id : undefined,
          createdAt: page.created_time
        } as Feedback;
    });
  } catch (error) {
    logger.error('Failed to fetch feedback:', error);
    return [];
  }
};

export const submitFeedback = async (traceId: string, memberId: string, rating: number, comment: string, feedbackId?: string) => {
   const validation = safeValidate(SubmitFeedbackSchema, {
     traceId,
     memberId,
     rating,
     comment,
     feedbackId,
   });

   if (!validation.success) {
     throw new Error(`Validation failed: ${validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
   }

   const validData = validation.data;

   if (isMockMode || !FEEDBACK_DB_ID) {
     logger.debug('Mock submission:', validData);
     return;
   }
   
   try {
     let targetId = validData.feedbackId;

     if (!targetId && validData.memberId) {
         const existingFeedback = await getFeedbackForTrace(validData.traceId);
         const match = existingFeedback.find(f => f.memberId === validData.memberId);
         if (match) {
             logger.debug(`Found existing feedback ${match.id} for member ${validData.memberId}, updating instead of creating.`);
             targetId = match.id;
         }
     }

     if (targetId) {
         await notionRequest(`pages/${targetId}`, 'PATCH', {
             properties: {
                 Comment: { title: [{ text: { content: validData.comment } }] },
                 Rating: { number: validData.rating }
             }
         });
         return;
     }

     const dbId = cleanId(FEEDBACK_DB_ID);
     const properties: any = {
         Comment: {
           title: [
             { text: { content: validData.comment } }
           ]
         },
         Rating: {
           number: validData.rating
         },
         Trace: {
           relation: [
             { id: validData.traceId }
           ]
         }
     };

     if (validData.memberId) {
         properties.Members = {
             relation: [
                 { id: validData.memberId }
             ]
         };
     }

     await notionRequest('pages', 'POST', {
       parent: { database_id: dbId },
       properties: properties
     });
   } catch (error) {
     logger.error('Failed to submit feedback:', error);
     throw error;
   }
};