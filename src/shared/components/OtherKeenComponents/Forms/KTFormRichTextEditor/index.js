import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CKEditor } from '@ckeditor/ckeditor5-react';
// import Editor from '@ckeditor/ckeditor5-build-classic';
// import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import MyCustomUploadAdapterPlugin from 'assets/plugins/CKEditorUploadAdapter';
import './style.scss';
import Editor from 'ckeditor5-custom-build/build/ckeditor';

KTFormRichTextEditor.propTypes = {
  name: PropTypes.string,
  data: PropTypes.string,
  onChange: PropTypes.func,
  fieldMeta: PropTypes.object,
  fieldHelper: PropTypes.object,

  enableCheckValid: PropTypes.bool,
  showValidState: PropTypes.bool,
  isTouched: PropTypes.bool,
  isValid: PropTypes.bool,
  feedbackText: PropTypes.string,
  text: PropTypes.string,
  disabled: PropTypes.bool,
};
KTFormRichTextEditor.defaultProps = {
  name: '',
  data: '',
  onChange: null,

  enableCheckValid: false,
  showValidState: false,
  isValid: true,
  isTouched: false,
  feedbackText: '',
  text: '',
  fieldHelper: {},
  fieldMeta: {},
  disabled: false,
};

function KTFormRichTextEditor(props) {
  // MARK: --- Params: ---
  const {
    data,
    onChange,
    name,
    enableCheckValid,
    showValidState,
    isValid,
    isTouched,
    feedbackText,
    text,
    fieldMeta,
    fieldHelper,
    disabled,
  } = props;
  const { error, touched } = fieldMeta;
  const isError = error && touched;

  // MARK: --- Functions: ---
  function handleChange(data) {
    if (onChange) {
      onChange(data);
    }
  }

  const CKInput = document.getElementsByClassName('ck-input-text');
  useEffect(() => {
    for (let i = 0; i < CKInput.length; i++) {
      CKInput[i].autofocus = true;
    }
    // console.log(CKInput);
  }, [CKInput]);

  return (
    <div className={`KTFormRichTextEditor rounded `}>
      <div className={`${isError ? 'border-danger border rounded' : ''}`}>
        <CKEditor
          id={name}
          editor={Editor}
          placeholder={'Nhập hoặc dán nội dung ở đây'}
          data={data}
          disabled={disabled}
          config={{
            extraPlugins: [MyCustomUploadAdapterPlugin],
            link: {
              decorators: {
                openInNewTab: {
                  mode: 'manual',
                  label: 'Open in a new tab',
                  defaultValue: true,
                  attributes: {
                    target: '_blank',
                  },
                },
                setAttributeNofollow: {
                  mode: 'manual',
                  label: 'Thuộc tính noopener noreferrer nofollow',
                  defaultValue: true,
                  attributes: {
                    rel: 'noopener noreferrer nofollow',
                  },
                },
              },
            },
            heading: {
              options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
              ],
            },
            image: {
              resizeOptions: [
                {
                  name: 'resizeImage:original',
                  value: null,
                  label: 'Original',
                },
                {
                  name: 'resizeImage:25',
                  value: '25',
                  label: '25%',
                },
                {
                  name: 'resizeImage:40',
                  value: '40',
                  label: '40%',
                },
                {
                  name: 'resizeImage:50',
                  value: '50',
                  label: '50%',
                },
                {
                  name: 'resizeImage:60',
                  value: '60',
                  label: '60%',
                },
                {
                  name: 'resizeImage:75',
                  value: '75',
                  label: '75%',
                },
              ],
            },
            placeholder: 'Nhập hoặc dán nội dung ở đây...',
          }}
          onReady={(editor) => {
            // You can store the "editor" and use when it is needed.
            // console.log('Editor is ready to use!', editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            // console.log({ event, editor, data });
            handleChange(data);
          }}
          onBlur={(event, editor) => {
            console.log('Blur.', editor);
            if (fieldHelper && fieldHelper?.setTouch) {
              fieldHelper?.setTouch(true);
            }
          }}
          onFocus={(event, editor) => {
            console.log('Focus.', editor);
          }}
        />
      </div>
      {text.length > 0 && <span className="form-text text-muted">{text}</span>}
      {isError && (
        <div className="fv-plugins-message-container">
          <div className="fv-help-block">{error}</div>
        </div>
      )}
    </div>
  );
}

export default KTFormRichTextEditor;
