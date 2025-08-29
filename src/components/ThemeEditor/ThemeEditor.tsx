import React, { useState, useEffect } from 'react';
import { Palette, Upload, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface OrganizationTheme {
  id?: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

const fontOptions = [
  { value: 'Inter', label: 'Inter (Padrão)' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' }
];

const ThemeEditor = () => {
  const { organization, updateOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrganizationTheme>({
    name: '',
    slug: '',
    primary_color: '#E6B800',
    secondary_color: '#F5F2ED',
    font_family: 'Inter'
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo_url: organization.logo_url,
        primary_color: organization.primary_color,
        secondary_color: organization.secondary_color,
        font_family: organization.font_family
      });
    }
  }, [organization]);

  const handleSave = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const { error } = await updateOrganization({
        name: formData.name,
        slug: formData.slug,
        logo_url: formData.logo_url,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        font_family: formData.font_family
      });

      if (error) {
        toast({
          title: 'Erro ao salvar',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Tema salvo com sucesso!',
          description: 'As alterações foram aplicadas à sua organização.',
        });
        
        // Apply theme changes to CSS variables
        applyThemeToCSS();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyThemeToCSS = () => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    const primaryHsl = hexToHsl(formData.primary_color);
    const secondaryHsl = hexToHsl(formData.secondary_color);
    
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.fontFamily = `${formData.font_family}, system-ui, sans-serif`;
  };

  const hexToHsl = (hex: string) => {
    // Simple hex to HSL conversion for demo
    // In production, you'd want a more robust conversion
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h! /= 6;
    }

    return `${Math.round(h! * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const resetToDefault = () => {
    setFormData({
      ...formData,
      primary_color: '#E6B800',
      secondary_color: '#F5F2ED',
      font_family: 'Inter'
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: generateSlug(value)
    });
  };

  return (
    <Card className="card-elegant max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Palette className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Editor de Tema</h2>
          <p className="text-sm text-muted-foreground">Personalize a aparência da sua marca</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="colors">Cores</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Organização</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Minha Empresa"
                className="input-elegant"
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="font">Fonte</Label>
            <Select 
              value={formData.font_family} 
              onValueChange={(value) => setFormData({ ...formData, font_family: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo da Empresa</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Arraste uma imagem ou clique para fazer upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG até 2MB
              </p>
              <Button variant="outline" className="mt-4" size="sm">
                Escolher arquivo
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary">Cor Primária</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primary"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-16 h-10 p-1 rounded"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#E6B800"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usada em botões principais, links e destaques
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary">Cor Secundária</Label>
                <div className="flex space-x-2">
                  <Input
                    id="secondary"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-16 h-10 p-1 rounded"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    placeholder="#F5F2ED"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usada em fundos de destaque e elementos secundários
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Paleta de Cores</h4>
              <div className="grid grid-cols-4 gap-3">
                {['#E6B800', '#F5F2ED', '#2A2621', '#E8E4E0'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, primary_color: color })}
                    className="w-full h-12 rounded-lg border-2 border-border hover:border-primary transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetToDefault}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar cores padrão
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div 
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: formData.secondary_color,
              fontFamily: formData.font_family
            }}
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: formData.primary_color }}>
                Visualização do Tema
              </h3>
              
              <p className="text-foreground">
                Este é um exemplo de como sua marca aparecerá para os clientes.
              </p>
              
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: formData.primary_color }}
                >
                  Botão Primário
                </button>
                <button 
                  className="px-4 py-2 rounded-lg border font-medium"
                  style={{ 
                    borderColor: formData.primary_color, 
                    color: formData.primary_color 
                  }}
                >
                  Botão Secundário
                </button>
              </div>
              
              <div className="mt-6 text-sm text-muted-foreground">
                <p>Fonte: {formData.font_family}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 mt-8">
        <Button variant="outline" onClick={resetToDefault}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar
        </Button>
        <Button onClick={handleSave} disabled={loading} className="btn-gold">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </Card>
  );
};

export default ThemeEditor;
