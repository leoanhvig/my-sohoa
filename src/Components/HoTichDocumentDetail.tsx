import {
  createHoTichDocumentRecord,
  deleteHoTichDocumentRecord,
  getHoTichDocumentsByUidFile,
  updateHoTichDocumentRecord,
  type HoTichDocumentRecord,
  type HoTichDocumentType,
  type SaveHoTichDocumentParams,
} from '@/apis/document'
import { getHoTichFileRecordsByIds } from '@/apis/file'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useUpdateFileRecord } from '@/hooks/useUpdateFileRecord'
import { useUserStore } from '@/stores/userStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type FormValues = Omit<
  SaveHoTichDocumentParams,
  'uid_file' | 'file_name' | 'enteredByUserId' | 'title' | 'entered_by_uid'
>

const emptyValues: FormValues = {
  type: 'marriage',
  document_number: '',
  registered_date: '',
  page_number: '',
  person_a: '',
  person_b: '',
  child_name: '',
  birth_date: '',
  deceased_name: '',
  death_date: '',
  adopter_name: '',
  adopted_name: '',
}

const labels: Record<HoTichDocumentType, string> = {
  marriage: 'Đăng ký kết hôn',
  birth: 'Khai sinh',
  death: 'Khai tử',
  adoption: 'Nhận nuôi con',
}

function formatDate(value: string): string {
  const text = value.trim()
  if (!text || text.includes('/') || !/^\d+$/.test(text)) return text
  if (text.length === 8)
    return `${text.slice(0, 2)}/${text.slice(2, 4)}/${text.slice(4)}`
  if (text.length === 6) return `${text.slice(0, 2)}/${text.slice(2)}`
  return text
}

function titleOf(values: FormValues): string {
  switch (values.type) {
    case 'marriage':
      return `${values.person_a.trim()} kết hôn với ${values.person_b.trim()}`.trim()
    case 'birth':
      return `${values.child_name.trim()} sinh ngày ${values.birth_date.trim()}`.trim()
    case 'death':
      return `${values.deceased_name.trim()} mất ngày ${values.death_date.trim()}`.trim()
    case 'adoption':
      return `${values.adopter_name.trim()} nhận nuôi ${values.adopted_name.trim()}`.trim()
  }
}

function fromRecord(record: HoTichDocumentRecord): FormValues {
  return {
    type: record.type,
    document_number: record.document_number,
    registered_date: record.registered_date,
    page_number: record.page_number,
    person_a: record.person_a,
    person_b: record.person_b,
    child_name: record.child_name,
    birth_date: record.birth_date,
    deceased_name: record.deceased_name,
    death_date: record.death_date,
    adopter_name: record.adopter_name,
    adopted_name: record.adopted_name,
  }
}

function validate(values: FormValues): string | null {
  if (
    values.type === 'marriage' &&
    (!values.person_a.trim() || !values.person_b.trim())
  )
    return 'Vui lòng nhập tên người A và người B.'
  if (
    values.type === 'birth' &&
    (!values.child_name.trim() || !values.birth_date.trim())
  )
    return 'Vui lòng nhập tên người khai sinh và ngày sinh.'
  if (
    values.type === 'death' &&
    (!values.deceased_name.trim() || !values.death_date.trim())
  )
    return 'Vui lòng nhập tên người mất và ngày mất.'
  if (
    values.type === 'adoption' &&
    (!values.adopter_name.trim() || !values.adopted_name.trim())
  )
    return 'Vui lòng nhập tên người nhận nuôi và người được nhận nuôi.'
  return null
}

function Field({
  label,
  value,
  onChange,
  isDate,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  isDate?: boolean
  required?: boolean
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <Input
        value={value}
        placeholder={isDate ? 'dd/mm/yyyy' : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => isDate && onChange(formatDate(value))}
      />
    </label>
  )
}

export default function HoTichDocumentDetail() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showTypedToast } = useToast()
  const authUser = useUserStore((state) => state.authUser)
  const { updateFileRecord, isUpdatingFileRecord } =
    useUpdateFileRecord('ho-tich')
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [editingRecord, setEditingRecord] =
    useState<HoTichDocumentRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingUid, setDeletingUid] = useState<string | null>(null)
  const fileUid = fileId || ''
  const {
    data: fileRecords = [],
    isLoading: loadingFile,
    error: fileError,
  } = useQuery({
    queryKey: ['ho-tich-files', 'detail', fileUid],
    queryFn: () => getHoTichFileRecordsByIds(fileUid ? [fileUid] : []),
    enabled: Boolean(fileUid),
  })
  const {
    data: records = [],
    isLoading: loadingRecords,
    error: recordsError,
  } = useQuery({
    queryKey: ['ho-tich-documents', 'by-file', fileUid],
    queryFn: () => getHoTichDocumentsByUidFile(fileUid),
    enabled: Boolean(fileUid),
  })
  const fileRecord = fileRecords[0] || null
  const generatedTitle = useMemo(() => titleOf(values), [values])

  useEffect(() => {
    setValues(emptyValues)
    setEditingRecord(null)
  }, [fileId])

  useEffect(() => {
    if (fileError) {
      console.error('Không tải được file Hộ tịch:', fileError)
    }
  }, [fileError])

  useEffect(() => {
    if (recordsError) {
      console.error('Không tải được danh sách hồ sơ Hộ tịch:', recordsError)
    }
  }, [recordsError])

  function setValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }
  function startEdit(record: HoTichDocumentRecord) {
    setValues(fromRecord(record))
    setEditingRecord(record)
  }
  function resetForm() {
    setValues(emptyValues)
    setEditingRecord(null)
  }

  function resetValuesAfterSave() {
    setValues((currentValues) => ({
      ...currentValues,
      document_number: '',
      page_number: '',
      person_a: '',
      person_b: '',
      child_name: '',
      birth_date: '',
      deceased_name: '',
      death_date: '',
      adopter_name: '',
      adopted_name: '',
    }))
    setEditingRecord(null)
  }

  async function handleSave() {
    if (!fileRecord) return
    const error = validate(values)
    if (error) {
      showTypedToast(EToastTypes.ERROR, error)
      return
    }
    const formatted = {
      ...values,
      registered_date: formatDate(values.registered_date),
      birth_date: formatDate(values.birth_date),
      death_date: formatDate(values.death_date),
    }
    const payload: SaveHoTichDocumentParams = {
      ...formatted,
      uid_file: fileRecord.uid,
      file_name: fileRecord.file_name,
      enteredByUserId: fileRecord.enteredByUserId,
      entered_by_uid: editingRecord?.entered_by_uid || authUser?.uid || '',
      title: titleOf(formatted),
    }
    try {
      setIsSaving(true)
      if (editingRecord) {
        await updateHoTichDocumentRecord(editingRecord.uid, payload)
      } else {
        await createHoTichDocumentRecord(payload)
        const nextDone = Math.min(
          (fileRecord.number_of_file_done || 0) + 1,
          fileRecord.number_of_file || (fileRecord.number_of_file_done || 0) + 1
        )
        await updateFileRecord({
          uid: fileRecord.uid,
          number_of_file_done: nextDone,
          is_completed:
            (fileRecord.number_of_file || 0) > 0 &&
            nextDone >= (fileRecord.number_of_file || 0),
        })
      }
      await queryClient.invalidateQueries({
        queryKey: ['ho-tich-documents', 'by-file', fileRecord.uid],
      })
      showTypedToast(
        EToastTypes.SUCCESS,
        editingRecord ? 'Đã cập nhật hồ sơ Hộ tịch.' : 'Đã lưu hồ sơ Hộ tịch.'
      )
      resetValuesAfterSave()
    } catch (saveError) {
      console.error('Không lưu được hồ sơ Hộ tịch:', saveError)
      showTypedToast(
        EToastTypes.ERROR,
        saveError instanceof Error
          ? saveError.message
          : 'Không lưu được hồ sơ Hộ tịch.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(record: HoTichDocumentRecord) {
    if (!fileRecord || !window.confirm(`Xóa hồ sơ "${record.title}"?`)) return
    try {
      setDeletingUid(record.uid)
      await deleteHoTichDocumentRecord(record.uid)
      await updateFileRecord({
        uid: fileRecord.uid,
        number_of_file_done: Math.max(
          (fileRecord.number_of_file_done || 0) - 1,
          0
        ),
        is_completed: false,
      })
      await queryClient.invalidateQueries({
        queryKey: ['ho-tich-documents', 'by-file', fileRecord.uid],
      })
      if (editingRecord?.uid === record.uid) resetForm()
      showTypedToast(EToastTypes.SUCCESS, 'Đã xóa hồ sơ Hộ tịch.')
    } catch (deleteError) {
      console.error('Không xóa được hồ sơ Hộ tịch:', deleteError)
      showTypedToast(EToastTypes.ERROR, 'Không xóa được hồ sơ Hộ tịch.')
    } finally {
      setDeletingUid(null)
    }
  }

  const saving = isSaving || isUpdatingFileRecord
  const typeFields =
    values.type === 'marriage' ? (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tên người A"
          required
          value={values.person_a}
          onChange={(value) => setValue('person_a', value)}
        />
        <Field
          label="Tên người B"
          required
          value={values.person_b}
          onChange={(value) => setValue('person_b', value)}
        />
      </div>
    ) : values.type === 'birth' ? (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tên người khai sinh"
          required
          value={values.child_name}
          onChange={(value) => setValue('child_name', value)}
        />
        <Field
          label="Ngày sinh"
          required
          isDate
          value={values.birth_date}
          onChange={(value) => setValue('birth_date', value)}
        />
      </div>
    ) : values.type === 'death' ? (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tên người mất"
          required
          value={values.deceased_name}
          onChange={(value) => setValue('deceased_name', value)}
        />
        <Field
          label="Ngày mất"
          required
          isDate
          value={values.death_date}
          onChange={(value) => setValue('death_date', value)}
        />
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tên người nhận nuôi"
          required
          value={values.adopter_name}
          onChange={(value) => setValue('adopter_name', value)}
        />
        <Field
          label="Tên người được nhận nuôi"
          required
          value={values.adopted_name}
          onChange={(value) => setValue('adopted_name', value)}
        />
      </div>
    )

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(420px,1fr)]">
        <DocumentPreviewPane
          fileRecord={fileRecord}
          previewUrl={getPreviewUrl(fileRecord)}
          isLoading={loadingFile}
          error={fileError || recordsError}
          page={Math.max(records.length + 1, 1)}
        />
        <aside className="min-h-0 overflow-y-auto bg-slate-50 p-4">
          <div className="flex items-center gap-3 py-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            <h1 className="truncate text-lg font-bold">
              {fileRecord?.file_name || 'Đang tải...'}
            </h1>
          </div>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">
                  {editingRecord ? 'Cập nhật hồ sơ' : 'Hồ sơ mới'}
                </h2>
                <p className="text-xs text-slate-500">
                  Chọn một loại văn bản duy nhất.
                </p>
              </div>
              {editingRecord && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={resetForm}
                >
                  <Plus className="mr-1 h-4 w-4" /> Tạo mới
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-bold text-slate-700">
                  Loại hồ sơ <span className="text-red-600">*</span>
                </span>
                <select
                  value={values.type}
                  onChange={(event) =>
                    setValue('type', event.target.value as HoTichDocumentType)
                  }
                  disabled={Boolean(editingRecord)}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                >
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Số, ký hiệu văn bản"
                  value={values.document_number}
                  onChange={(value) => setValue('document_number', value)}
                />
                <Field
                  label="Ngày tháng đăng ký"
                  isDate
                  value={values.registered_date}
                  onChange={(value) => setValue('registered_date', value)}
                />
                <Field
                  label="Số tờ"
                  value={values.page_number}
                  onChange={(value) => setValue('page_number', value)}
                />
              </div>
              {typeFields}
              <div className="rounded-lg bg-indigo-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                  Tiêu đề tự sinh
                </p>
                <p className="mt-1 text-sm font-bold text-indigo-950">
                  {generatedTitle || 'Nhập dữ liệu để tạo tiêu đề.'}
                </p>
              </div>
              <Button
                type="button"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                    lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />{' '}
                    {editingRecord ? 'Lưu cập nhật' : 'Lưu hồ sơ Hộ tịch'}
                  </>
                )}
              </Button>
            </div>
          </section>
          <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-bold">Hồ sơ đã nhập ({records.length})</h2>
            </div>
            {loadingRecords ? (
              <div className="p-6 text-center text-sm text-slate-500">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Đang
                tải...
              </div>
            ) : records.length ? (
              <div className="divide-y divide-slate-100">
                {[...records].reverse().map((record, index) => (
                  <div key={record.uid} className="flex gap-2 p-4">
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate font-bold">
                        {records.length - index}. {record.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Số tờ: {record.page_number || 'Chưa có'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="link"
                      className=" hover:bg-gray-50 rounded-lg p-3"
                      onClick={() => startEdit(record)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="link"
                      className="text-red-600 hover:bg-red-50 rounded-lg p-3"
                      disabled={Boolean(deletingUid) || saving}
                      onClick={() => handleDelete(record)}
                    >
                      {deletingUid === record.uid ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-sm font-semibold text-slate-500">
                Chưa có hồ sơ Hộ tịch nào.
              </p>
            )}
          </section>
        </aside>
      </div>
    </main>
  )
}
