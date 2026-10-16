'use client';

import { useCallback, useMemo, useRef } from 'react';
import JoditEditor from 'jodit-react';
import { toast } from 'react-toastify';
import ApiService from '../utils/apiService';

const JoditEditorComponent = ({
  value = '',
  onChange,
  placeholder = 'Enter content...',
  disabled = false,
  height = 300,
  config = {},
  id,
  name,
  onAssetUpload,
}) => {
  const editor = useRef(null);
  const fileInputRef = useRef(null);

  const emitChange = useCallback((nextValue) => {
    if (!onChange) return;
    onChange({
      target: {
        name: name || 'content',
        value: nextValue,
      },
    });
  }, [name, onChange]);

  const openFileBrowser = useCallback(
    () =>
      new Promise((resolve) => {
        const input = fileInputRef.current;
        if (!input || disabled) {
          resolve(null);
          return;
        }

        input.value = '';
        input.onchange = (event) => {
          const file = event.target.files?.[0] || null;
          input.onchange = null;
          resolve(file);
        };
        input.click();
      }),
    [disabled]
  );

  const handleToolbarImageUpload = useCallback(async (editorInstance) => {
    const file = await openFileBrowser();
    if (!file) return false;

    const result = await ApiService.upload(file);
    if (result.status !== 200 || !result.data?.url) {
      toast.error(result.message || 'Could not upload image');
      return false;
    }

    if (onAssetUpload) onAssetUpload(result.data.url);

    const altText = String(file.name || '')
      .replace(/\.[^.]+$/, '')
      .replace(/"/g, '&quot;');

    editorInstance?.s?.insertHTML(`<img src="${result.data.url}" alt="${altText}" />`);
    emitChange(editorInstance?.value || '');
    toast.success('Image uploaded');
    return false;
  }, [emitChange, onAssetUpload, openFileBrowser]);

  const editorConfig = useMemo(() => {
    const uploadImageButton = {
      name: 'uploadImage',
      icon: 'image',
      tooltip: 'Upload image from device',
      exec: (editorInstance) => handleToolbarImageUpload(editorInstance),
    };

    const extraButtons = Array.isArray(config.extraButtons)
      ? [...config.extraButtons, uploadImageButton]
      : [uploadImageButton];

    return {
      readonly: disabled,
      placeholder,
      height,
      toolbar: true,
      spellcheck: true,
      language: 'en',
      toolbarButtonSize: 'medium',
      toolbarAdaptive: true,
      showPlaceholder: true,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      showPoweredBy: false,
      ...config,
      extraButtons,
    };
  }, [config, disabled, handleToolbarImageUpload, height, placeholder]);

  return (
    <div className="jodit-editor-wrapper" id={id} name={name}>
      <input type="hidden" id={id} name={name} value={value} readOnly />
      <input ref={fileInputRef} type="file" accept="image/*" hidden />
      <JoditEditor
        ref={editor}
        value={value}
        config={editorConfig}
        onBlur={(newContent) => {
          emitChange(newContent);
        }}
      />
    </div>
  );
};

export default JoditEditorComponent;

