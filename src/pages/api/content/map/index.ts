import { whenNotError, whenNotErrorAll } from '@devprotocol/util-ts'
import { nanoid } from 'nanoid'
import {
    updateContentByPayload,
    withCheckingIndex,
    getDefaultClient,
  } from '../db/redis'

export const POST = async ({ request }: { request: Request }) => {
    const { sTokenPayload, source } =
    (await request.json()) as {
        sTokenPayload: string
        source: string
    }
    const client = await withCheckingIndex(getDefaultClient)
    const id = nanoid()
    const contentUploadStatus = await updateContentByPayload(
        {
            sTokenPayload,
            source,
            id,
            createdOnTimestamp: Date.now(),
        },
        client,
    )
    if (contentUploadStatus instanceof Error) {
        return new Response(JSON.stringify({ error: 'Error' }), {
            status: 500,
        })
    }
    await client.quit()
    return new Response(JSON.stringify({ content_record_id: id }), {
        status: 200,
    })
}