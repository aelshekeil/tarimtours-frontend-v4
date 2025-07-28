-- This script is for one-time use to fix corrupted image URLs in the travel_accessories table.
-- It finds URLs that have been duplicated and corrects them.

DO $$
DECLARE
    accessory_record RECORD;
    image_json JSONB;
    new_images_json JSONB;
    image_url TEXT;
    base_url TEXT := 'https://vrvrhzseqnjpriqesgoj.supabase.co';
    corrected_url TEXT;
BEGIN
    FOR accessory_record IN SELECT * FROM travel_accessories
    LOOP
        new_images_json := '[]'::JSONB;
        FOR image_json IN SELECT * FROM jsonb_array_elements(accessory_record.images)
        LOOP
            image_url := image_json->>'url';
            IF image_url LIKE base_url || '%' THEN
                -- URL is potentially duplicated, let's fix it.
                -- This will take the last occurrence of http and build the url from there.
                corrected_url := 'https://' || substring(image_url from 'https://(.*)');
                
                -- A more robust way to remove the duplicate part
                corrected_url := replace(image_url, base_url || base_url, base_url);

                -- A simple replace might be enough if the pattern is consistent
                corrected_url := replace(image_url, base_url||'/'||base_url, base_url);
                
                -- Let's try a more specific replace
                corrected_url := replace(image_url, 'https://vrvrhzseqnjpriqesgoj.supabase.co/https://vrvrhzseqnjpriqesgoj.supabase.co/', 'https://vrvrhzseqnjpriqesgoj.supabase.co/');

            ELSE
                corrected_url := image_url;
            END IF;

            new_images_json := new_images_json || jsonb_build_object('url', corrected_url);
        END LOOP;

        UPDATE travel_accessories
        SET images = new_images_json
        WHERE id = accessory_record.id;
    END LOOP;
END $$;