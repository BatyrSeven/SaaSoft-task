<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAccountStore } from '../stores/accountStore'
import { EyeIcon, EyeSlashIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'

const store = useAccountStore()

onMounted(() => {
  store.loadFromStorage()
})

watch(
  () => store.accounts,
  () => {
    store.saveToStorage()
  },
  { deep: true }
)
</script>

<template>
  <div class="px-4">
    <div class="flex items-center justify-start gap-4 mb-4 py-3">
      <h2 class="text-2xl font-bold">Учетные записи</h2>
      <button
        class="px-3 py-2 flex items-center gap-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800 cursor-pointer transition-colors"
        @click="store.addAccount">
        <PlusIcon class="w-6 h-6" />
      </button>
    </div>

    <p class="bg-blue-50 text-blue-800 p-2 rounded-md mb-4">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель <code>;</code>
    </p>

    <div class="grid grid-cols-[12rem_9rem_24rem_auto] gap-4 text-sm text-gray-500 font-medium mb-2">
      <div>Метки</div>
      <div>Тип</div>
      <div>Логин и пароль</div>
      <div></div>
    </div>

    <div v-for="(account, index) in store.accounts" :key="index"
      class="grid grid-cols-[12rem_9rem_24rem_auto] gap-4 items-start mb-4">
      <div class="flex flex-col">
        <input v-model="account.labelsRaw" placeholder="Метки" @blur="store.validateAndSave(index)" :class="[
          'border rounded px-3 py-2 w-full',
          account.errors.labelsRaw ? 'border-red-500' : 'border-gray-300'
        ]" />
        <span v-if="account.errors.labelsRaw" class="text-sm text-red-500 mt-1">
          {{ account.errors.labelsRaw }}
        </span>
      </div>

      <div class="flex flex-col">
        <select v-model="account.type" @change="store.validateAndSave(index)"
          class="border rounded px-3 py-2 border-gray-300">
          <option value="Local">Локальная</option>
          <option value="LDAP">LDAP</option>
        </select>
      </div>

      <div class="flex gap-4 w-full">
        <div class="flex flex-col" :class="account.type === 'LDAP' ? 'w-full' : 'w-1/2'">
          <input v-model="account.login" placeholder="Логин" @blur="store.validateAndSave(index)" :class="[
            'border rounded px-3 py-2 w-full',
            account.errors.login ? 'border-red-500' : 'border-gray-300'
          ]" />
          <span v-if="account.errors.login" class="text-sm text-red-500 mt-1">
            {{ account.errors.login }}
          </span>
        </div>

        <div v-if="account.type === 'Local'" class="flex flex-col relative w-1/2">
          <input v-model="account.password" :type="account.showPassword ? 'text' : 'password'" placeholder="Пароль"
            @blur="store.validateAndSave(index)" :class="[
              'border rounded px-3 py-2 pr-10 w-full',
              account.errors.password ? 'border-red-500' : 'border-gray-300'
            ]" />
          <button type="button" @click="store.togglePassword(index)"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black" title="Показать пароль">
            <component :is="account.showPassword ? EyeSlashIcon : EyeIcon" class="w-5 h-5" />
          </button>
          <span v-if="account.errors.password" class="text-sm text-red-500 mt-1">
            {{ account.errors.password }}
          </span>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button @click="store.removeAccount(index)" class="text-red-600 hover:text-red-800" title="Удалить">
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
