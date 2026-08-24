import type { ParamsDictionary, Request, Response } from "express";
import {
    createNote,
    getNotesByUserId,
    getNoteById,
    updateNote,
    deleteNote,
} from "../models/noteModel.js";

export interface NoteRequestPayload {
    title: string;
    content: string;
}

export interface Note {
    id: string | number;
    user_id: string | number;
    title: string;
    content: string;
    created_at: string | Date;
    updated_at: string | Date;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
}

export interface ApiSuccessResponse<Data> {
    success: true;
    data: Data;
    message?: string;
}

export type NoteResponse = ApiSuccessResponse<Note> | ApiErrorResponse;
export type NotesResponse = ApiSuccessResponse<Note[]> | ApiErrorResponse;
export type DeleteNoteResponse =
    | { success: true; message: string }
    | ApiErrorResponse;
export type NoteControllerResponse =
    | NoteResponse
    | NotesResponse
    | DeleteNoteResponse;

interface AuthenticatedUser {
    userId: string | number;
}

interface RequestLogger {
    error(error: unknown, message: string): void;
}

export interface AuthenticatedRequest<
    RouteParams extends ParamsDictionary = ParamsDictionary,
    RequestBody = NoteRequestPayload,
> extends Request<RouteParams, NoteControllerResponse, RequestBody> {
    user: AuthenticatedUser;
    log: RequestLogger;
}

export const createNoteController = async (
    req: AuthenticatedRequest<ParamsDictionary, NoteRequestPayload>,
    res: Response<NoteResponse>
): Promise<Response<NoteResponse>> => {
    try {
        const { title, content } = req.body;
        const userId = req.user.userId;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const note = await createNote(userId, title, content);

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note,
        });
    } catch (error) {
        req.log.error(error, "Failed to create note");

        return res.status(500).json({
            success: false,
            message: "Failed to create note",
        });
    }
};

export const getNotesController = async (
    req: AuthenticatedRequest<ParamsDictionary, undefined>,
    res: Response<NotesResponse>
): Promise<Response<NotesResponse>> => {
    try {
        const notes = await getNotesByUserId(req.user.userId);

        return res.status(200).json({
            success: true,
            data: notes,
        });
    } catch (error) {
        req.log.error(error, "Failed to fetch notes");

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notes",
        });
    }
};

export const getNoteController = async (
    req: AuthenticatedRequest<NoteRouteParams, undefined>,
    res: Response<NoteResponse>
): Promise<Response<NoteResponse>> => {
    try {
        const note = await getNoteById(req.params.id, req.user.userId);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: note,
        });
    } catch (error) {
        req.log.error(error, "Failed to fetch note");

        return res.status(500).json({
            success: false,
            message: "Failed to fetch note",
        });
    }
};

export interface NoteRouteParams extends ParamsDictionary {
    id: string;
}

export const updateNoteController = async (
    req: AuthenticatedRequest<NoteRouteParams, NoteRequestPayload>,
    res: Response<NoteResponse>
): Promise<Response<NoteResponse>> => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const note = await updateNote(
            req.params.id,
            req.user.userId,
            title,
            content
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: note,
        });
    } catch (error) {
        req.log.error(error, "Failed to update note");

        return res.status(500).json({
            success: false,
            message: "Failed to update note",
        });
    }
};

export const deleteNoteController = async (
    req: AuthenticatedRequest<NoteRouteParams, undefined>,
    res: Response<DeleteNoteResponse>
): Promise<Response<DeleteNoteResponse>> => {
    try {
        const deletedNote = await deleteNote(req.params.id, req.user.userId);

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully",
        });
    } catch (error) {
        req.log.error(error, "Failed to delete note");

        return res.status(500).json({
            success: false,
            message: "Failed to delete note",
        });
    }
};